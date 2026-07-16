// PULSE — Gemini Function-Calling Tool Schemas
// All 8 tools registered with the agent core

export const TOOL_SCHEMAS = [
  // ===== CROWD MODULE =====
  {
    name: "crowd__getZoneDensity",
    description:
      "Returns current occupancy %, capacity, and 15-min trend for one or all stadium zones. Use when asked about crowd levels, congestion, or zone capacity.",
    parameters: {
      type: "object",
      properties: {
        zoneId: {
          type: "string",
          description: "The zone ID (A-H). Omit to get all zones.",
        },
      },
    },
  },
  {
    name: "crowd__forecastCongestion",
    description:
      "Forecasts crowd density for a specific zone over the next N minutes using trend data. Returns predicted occupancy % and risk level.",
    parameters: {
      type: "object",
      properties: {
        zoneId: { type: "string", description: "Zone ID to forecast" },
        horizonMinutes: { type: "number", description: "Minutes into the future to forecast (max 60)" },
      },
      required: ["zoneId", "horizonMinutes"],
    },
  },
  {
    name: "crowd__suggestReroute",
    description:
      "Analyzes current and forecast density across all zones and suggests optimal fan rerouting. Use when a zone is above 80% capacity.",
    parameters: {
      type: "object",
      properties: {
        fromZoneId: { type: "string", description: "Congested zone to route fans away from" },
      },
      required: ["fromZoneId"],
    },
  },
  // ===== NAV MODULE =====
  {
    name: "nav__findPath",
    description:
      "Finds the shortest path between two locations in the stadium using A* pathfinding. Returns path nodes and estimated walk time.",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string", description: "Starting location or node ID" },
        to: { type: "string", description: "Destination location or node ID" },
        avoidHighDensity: { type: "boolean", description: "If true, avoid zones above 80% occupancy" },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "nav__locateAmenity",
    description:
      "Finds the nearest amenity (restroom, food, first-aid, exit) from a given location, optionally avoiding crowded zones.",
    parameters: {
      type: "object",
      properties: {
        amenityType: {
          type: "string",
          enum: ["restroom", "food", "first-aid", "exit", "atm"],
          description: "Type of amenity to find",
        },
        fromLocation: { type: "string", description: "Current location (section or node)" },
      },
      required: ["amenityType", "fromLocation"],
    },
  },
  // ===== OPS MODULE =====
  {
    name: "ops__getOpenIncidents",
    description:
      "Returns currently open incidents, optionally filtered by severity or type. Use before making recommendations.",
    parameters: {
      type: "object",
      properties: {
        severity: { type: "string", enum: ["critical", "warning", "info"], description: "Filter by severity" },
        type: { type: "string", enum: ["medical", "security", "crowd", "logistics", "technical"] },
      },
    },
  },
  {
    name: "ops__recommendAction",
    description:
      "Generates a structured operational recommendation for a specific incident, cross-referencing crowd density and navigation data.",
    parameters: {
      type: "object",
      properties: {
        incidentId: { type: "string", description: "Incident ID to recommend action for" },
      },
      required: ["incidentId"],
    },
  },
  // ===== LANG MODULE =====
  {
    name: "lang__translateAndAnnounce",
    description:
      "Translates a message into multiple languages and formats it as a stadium broadcast announcement. Always use for fan-facing messages.",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string", description: "Original English message to translate" },
        languages: {
          type: "array",
          items: { type: "string" },
          description: "Target language codes, e.g. ['es', 'fr', 'hi', 'ar']",
        },
        context: {
          type: "string",
          enum: ["emergency", "navigation", "general", "promotional"],
          description: "Broadcast context affects tone and urgency",
        },
      },
      required: ["message", "languages"],
    },
  },
];
