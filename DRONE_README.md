# ADS Drone Design System MCP Integration

This directory contains configuration and integration files for connecting to the ADS (Agoda Design System) Drone MCP (Model Context Protocol) server.

## 🚁 What is Drone MCP?

Drone MCP is a server that provides access to Agoda's design system components, design tokens, and component specifications through a standardized protocol.

## 📁 Files

- **`mcp-config.json`** - MCP server configuration in JSON format
- **`drone-config.js`** - JavaScript configuration with API endpoints and settings
- **`drone-integration.js`** - Example client class for interacting with the MCP server

## 🔧 Configuration

### Basic MCP Configuration
```json
{
  "mcpServers": {
    "drone-mcp": {
      "url": "https://mcp-drone-js.sg.agoda.is/mcp/",
      "description": "ADS Drone Design System MCP Server"
    }
  }
}
```

### Environment Variables
Set these environment variables for authentication:
```bash
DRONE_MCP_API_KEY=your_api_key_here
DRONE_MCP_ENVIRONMENT=production
```

## 🚀 Usage

### Basic Integration
```javascript
import { DroneMCPClient } from './drone-integration.js';

const droneClient = new DroneMCPClient();

// Connect to the MCP server
await droneClient.connect();

// Get design tokens
const tokens = await droneClient.getDesignTokens();

// Get component specifications
const buttonSpecs = await droneClient.getComponentSpecs('Button');

// Generate component code
const buttonCode = await droneClient.generateComponentCode('Button', {
  variant: 'primary',
  size: 'medium'
});
```

### Available Endpoints

- **`/health`** - Server health check
- **`/design-tokens`** - Get design system tokens
- **`/components/{name}`** - Get component specifications
- **`/components/{name}/generate`** - Generate component code
- **`/themes`** - Get available themes
- **`/docs`** - Get documentation

## 🔐 Authentication

The MCP server requires API key authentication. Include your API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

## 📚 Capabilities

The Drone MCP server provides:

- **Design Tokens** - Colors, typography, spacing, etc.
- **Component Specs** - Detailed component documentation
- **Code Generation** - Generate component code with props
- **Theme Management** - Access to different design themes
- **Validation** - Design system compliance checking

## 🛠️ Customization

You can customize the configuration by modifying `drone-config.js`:

```javascript
const customConfig = {
  ...droneConfig,
  components: {
    ...droneConfig.components,
    theme: 'dark',
    locale: 'th-TH'
  }
};

const droneClient = new DroneMCPClient(customConfig);
```

## 🚨 Troubleshooting

### Connection Issues
- Verify the MCP server URL is correct
- Check your API key is valid
- Ensure network access to the server

### Authentication Errors
- Verify API key format: `Bearer YOUR_KEY`
- Check key permissions and expiration
- Ensure correct environment (dev/staging/prod)

### Component Issues
- Verify component names are correct
- Check component version compatibility
- Review required props and validation

## 📖 More Information

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [ADS Design System](https://design.agoda.com/)
- [Drone Component Library](https://drone.agoda.com/)

## 🤝 Support

For issues with the Drone MCP server or design system:
- Check the internal documentation
- Contact the ADS team
- Review server logs and health endpoints
