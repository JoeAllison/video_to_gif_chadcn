// Example integration with ADS Drone Design System MCP
import droneConfig from './drone-config.js';

class DroneMCPClient {
  constructor(config = droneConfig) {
    this.config = config;
    this.baseUrl = config.api.baseUrl;
    this.authHeader = config.auth.header;
    this.authValue = config.auth.value;
  }

  // Initialize connection to MCP server
  async connect() {
    try {
      console.log('Connecting to Drone MCP server...');
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          [this.authHeader]: this.authValue,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Connected to Drone MCP server');
        return true;
      } else {
        throw new Error(`Connection failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to connect to Drone MCP server:', error);
      return false;
    }
  }

  // Get design tokens from the system
  async getDesignTokens() {
    try {
      const response = await fetch(`${this.baseUrl}/design-tokens`, {
        headers: {
          [this.authHeader]: this.authValue,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const tokens = await response.json();
        console.log('🎨 Design tokens retrieved:', tokens);
        return tokens;
      } else {
        throw new Error(`Failed to get design tokens: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error getting design tokens:', error);
      return null;
    }
  }

  // Get component specifications
  async getComponentSpecs(componentName) {
    try {
      const response = await fetch(`${this.baseUrl}/components/${componentName}`, {
        headers: {
          [this.authHeader]: this.authValue,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const specs = await response.json();
        console.log(`🔧 Component specs for ${componentName}:`, specs);
        return specs;
      } else {
        throw new Error(`Failed to get component specs: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error getting component specs for ${componentName}:`, error);
      return null;
    }
  }

  // Generate component code
  async generateComponentCode(componentName, props = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/components/${componentName}/generate`, {
        method: 'POST',
        headers: {
          [this.authHeader]: this.authValue,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          component: componentName,
          props,
          theme: this.config.components.theme,
          version: this.config.components.version
        })
      });
      
      if (response.ok) {
        const code = await response.json();
        console.log(`💻 Generated code for ${componentName}:`, code);
        return code;
      } else {
        throw new Error(`Failed to generate component code: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error generating component code for ${componentName}:`, error);
      return null;
    }
  }
}

// Usage example
async function exampleUsage() {
  const droneClient = new DroneMCPClient();
  
  // Connect to the MCP server
  const connected = await droneClient.connect();
  if (!connected) {
    console.log('Cannot proceed without connection');
    return;
  }
  
  // Get design tokens
  const tokens = await droneClient.getDesignTokens();
  
  // Get component specs
  const buttonSpecs = await droneClient.getComponentSpecs('Button');
  
  // Generate component code
  const buttonCode = await droneClient.generateComponentCode('Button', {
    variant: 'primary',
    size: 'medium',
    disabled: false
  });
  
  console.log('Example usage completed!');
}

// Export for use in other files
export { DroneMCPClient, exampleUsage };
