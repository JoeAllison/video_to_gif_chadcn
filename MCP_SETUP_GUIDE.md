# MCP Setup Guide: Figma + Drone Design System

This guide shows you how to set up and use both the **Figma MCP** and **Drone MCP** servers to extract designs from Figma and generate code using the ADS Drone design system.

## 🚀 **Quick Start**

### 1. MCP Configuration
Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "figma-mcp": {
      "url": "https://mcp-figma.sg.agoda.is/mcp/"
    },
    "drone-mcp": {
      "url": "https://mcp-drone-js.sg.agoda.is/mcp/"
    }
  }
}
```

### 2. Supported MCP Clients
- **Cursor** ✅
- **Claude Code** ✅
- **Other MCP-compatible clients**

## 🎨 **Figma MCP Usage**

### For Claude Code Users:
Use the built-in prompt:
```
/figma-mcp:figma_to_drone_js_code_system_prompt
```

### For Other Clients:
Use this system prompt:
```
You are an expert at converting Figma designs to Drone.js code. 
Use the figma-mcp to extract design information and drone-mcp to generate code.
```

### How to Use:
1. **Go to Figma design**
2. **Right-click on any frame**
3. **Click "Copy link to selection"**
4. **Paste the link in your MCP client**
5. **Watch the magic happen! ✨**

## 🚁 **Drone MCP Usage**

### Available Tools:
- `get_design_tokens` - Get colors, typography, spacing
- `get_component_specs` - Get component documentation
- `generate_component_code` - Generate code with props
- `validate_design_system` - Check design compliance

### Example Usage:
```javascript
// Get design tokens
const tokens = await droneMCP.getDesignTokens();

// Get component specs
const buttonSpecs = await droneMCP.getComponentSpecs('Button');

// Generate component code
const buttonCode = await droneMCP.generateComponentCode('Button', {
  variant: 'primary',
  size: 'medium'
});
```

## 🔧 **Complete Workflow**

### 1. Design Extraction
```
User: "Convert this Figma design to Drone.js code"
[Pastes Figma link]
```

### 2. MCP Processing
- **Figma MCP** extracts design information
- **Drone MCP** generates component code
- **Result**: Production-ready Drone.js components

### 3. Code Generation
The system will:
- Analyze Figma layers and components
- Map to Drone design system tokens
- Generate semantic HTML/CSS/JS
- Provide component props and variants

## 📱 **Example Use Cases**

### Button Component
```javascript
// Figma design → Drone.js code
<Button 
  variant="primary" 
  size="medium" 
  disabled={false}
>
  Click me
</Button>
```

### Form Layout
```javascript
// Complex Figma layouts → Responsive Drone components
<Form>
  <FormField label="Email" required>
    <Input type="email" placeholder="Enter email" />
  </FormField>
  <Button type="submit">Submit</Button>
</Form>
```

### Card Components
```javascript
// Figma cards → Drone card system
<Card>
  <CardHeader>
    <CardTitle>Design System</CardTitle>
    <CardDescription>Modern UI components</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Generated from Figma design</p>
  </CardContent>
</Card>
```

## 🛠 **Configuration Files**

### mcp-config.json
```json
{
  "mcpServers": {
    "figma-mcp": {
      "url": "https://mcp-figma.sg.agoda.is/mcp/"
    },
    "drone-mcp": {
      "url": "https://mcp-drone-js.sg.agoda.is/mcp/"
    }
  }
}
```

### Environment Variables
```bash
# If authentication is required
DRONE_MCP_API_KEY=your_api_key_here
FIGMA_MCP_ACCESS_TOKEN=your_figma_token_here
```

## 🎯 **Best Practices**

### 1. Design Preparation
- Use consistent naming in Figma
- Group related elements logically
- Use proper layer hierarchy
- Include component variants

### 2. Code Generation
- Review generated code for accuracy
- Customize props and variants as needed
- Test components in your environment
- Follow Drone design system guidelines

### 3. Iteration
- Start with simple components
- Gradually increase complexity
- Use the system for rapid prototyping
- Refine generated code for production

## 🚨 **Troubleshooting**

### Common Issues:
1. **MCP Connection Failed**
   - Check server URLs
   - Verify network access
   - Check authentication tokens

2. **Figma Access Denied**
   - Ensure Figma file is accessible
   - Check sharing permissions
   - Verify access tokens

3. **Code Generation Errors**
   - Check component availability in Drone
   - Verify design system compatibility
   - Review error logs

### Getting Help:
- Check MCP server health endpoints
- Review server documentation
- Contact the ADS team
- Check internal knowledge base

## 🔮 **Future Enhancements**

### Planned Features:
- **Batch Processing** - Convert multiple components
- **Design Validation** - Check against design system
- **Code Templates** - Custom generation patterns
- **Integration APIs** - Direct Figma → Drone sync

### Advanced Usage:
- **Design System Migration** - Convert existing designs
- **Component Libraries** - Build reusable collections
- **Theme Generation** - Create custom themes
- **Accessibility Audit** - Check component compliance

## 📚 **Resources**

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Figma Developer Platform](https://www.figma.com/developers)
- [ADS Design System](https://design.agoda.com/)
- [Drone Component Library](https://drone.agoda.com/)

## 🎉 **Ready to Start!**

You now have everything you need to:
1. **Extract designs from Figma** using `figma-mcp`
2. **Generate code using Drone** using `drone-mcp`
3. **Create production-ready components** automatically

Start with a simple Figma design and watch the magic happen! ✨🚁
