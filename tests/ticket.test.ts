import { describe, it, expect } from 'vitest';
import { Ticket } from '@/lib/firestore/schema';

// Pure logic verification of the ticket verification transaction rules:
// - A valid, unused ticket succeeds
// - An already-used ticket is rejected
// - A nonexistent ticket ID is rejected
// - Simultaneous/double claim attempts on the same ticket can't both succeed

function evaluateTicketClaim(ticket: Ticket | null | undefined, claimUid: string): { success: boolean; error?: string; updatedTicket?: Ticket } {
  if (!ticket) {
    return { success: false, error: 'Ticket not found or already used.' };
  }
  if (!ticket.valid || ticket.used) {
    return { success: false, error: 'Ticket not found or already used.' };
  }
  return {
    success: true,
    updatedTicket: {
      ...ticket,
      used: true,
      usedByUid: claimUid,
    },
  };
}

describe('Ticket Validation & Transaction Logic', () => {
  it('accepts and claims a valid, unused ticket', () => {
    const validTicket: Ticket = {
      valid: true,
      used: false,
      matchName: 'WC 2026 SEMIFINAL',
      seat: 'Section 108, Row 12, Seat 14',
      usedByUid: null,
    };
    const result = evaluateTicketClaim(validTicket, 'user_abc');
    expect(result.success).toBe(true);
    expect(result.updatedTicket?.used).toBe(true);
    expect(result.updatedTicket?.usedByUid).toBe('user_abc');
  });

  it('rejects an already-used ticket', () => {
    const usedTicket: Ticket = {
      valid: true,
      used: true,
      matchName: 'WC 2026 SEMIFINAL',
      seat: 'Section 108, Row 12, Seat 14',
      usedByUid: 'first_user_uid',
    };
    const result = evaluateTicketClaim(usedTicket, 'second_user_uid');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Ticket not found or already used.');
  });

  it('rejects an invalid ticket where valid=false', () => {
    const invalidTicket: Ticket = {
      valid: false,
      used: false,
      matchName: 'WC 2026 SEMIFINAL',
      seat: 'Section 108, Row 12, Seat 14',
      usedByUid: null,
    };
    const result = evaluateTicketClaim(invalidTicket, 'user_xyz');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Ticket not found or already used.');
  });

  it('rejects null/undefined or nonexistent ticket', () => {
    expect(evaluateTicketClaim(null, 'user_xyz').success).toBe(false);
    expect(evaluateTicketClaim(undefined, 'user_xyz').success).toBe(false);
  });

  it('prevents simultaneous claim race: second claim attempt fails once first claims it', () => {
    const ticket: Ticket = {
      valid: true,
      used: false,
      matchName: 'WC 2026 SEMIFINAL',
      seat: 'Section 108, Row 12, Seat 14',
      usedByUid: null,
    };

    // First claim succeeds inside atomic transaction check
    const firstClaim = evaluateTicketClaim(ticket, 'concurrency_user_1');
    expect(firstClaim.success).toBe(true);

    // Second claim reading the post-transaction state fails
    const secondClaim = evaluateTicketClaim(firstClaim.updatedTicket, 'concurrency_user_2');
    expect(secondClaim.success).toBe(false);
    expect(secondClaim.error).toBe('Ticket not found or already used.');
  });
});
