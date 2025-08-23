// ADS Drone Design System MCP Configuration
const droneConfig = {
  mcp: {
    url: "https://mcp-drone-js.sg.agoda.is/mcp/",
    description: "ADS Drone Design System MCP Server",
    version: "1.0.0"
  },
  
  // API Configuration
  api: {
    baseUrl: "https://mcp-drone-js.sg.agoda.is/mcp/",
    endpoints: {
      designTokens: "/design-tokens",
      components: "/components",
      themes: "/themes",
      documentation: "/docs"
    },
    timeout: 30000,
    retryAttempts: 3
  },
  
  // Authentication
  auth: {
    type: "api_key",
    header: "Authorization",
    value: process.env.DRONE_MCP_API_KEY || "YOUR_API_KEY_HERE"
  },
  
  // Component Library Settings
  components: {
    version: "latest",
    theme: "default",
    locale: "en-US",
    cacheEnabled: true
  },
  
  // Available Tools/Capabilities
  capabilities: [
    "get_design_tokens",
    "get_component_specs", 
    "generate_component_code",
    "validate_design_system",
    "get_theme_variables",
    "export_component_library"
  ]
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = droneConfig;
} else if (typeof window !== 'undefined') {
  window.droneConfig = droneConfig;
}

export default droneConfig;
