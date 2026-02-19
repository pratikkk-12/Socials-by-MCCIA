
import { Category, Template } from './types';

export const STARTERS = [
  { text: "Forge a 5-day Instagram launch campaign", icon: "🚀" },
  { text: "Architect an n8n workflow for lead capture", icon: "⚙️" },
  { text: "Design a technical support persona", icon: "🤖" },
  { text: "Create an API mock for a fintech dashboard", icon: "💳" }
];

export const CATEGORIES: Category[] = [
  {
    id: "social_calendar",
    name: "Social Campaign",
    icon: "Calendar",
    description: "Generate multi-platform campaign schedules with visual prompts.",
    fields: [
      { name: "campaign_goal", type: "text", required: true, placeholder: "e.g., Product Launch" },
      { name: "platforms", type: "array", default: ["instagram", "linkedin"] },
      { name: "post_frequency", type: "select", options: ["Daily", "Every 2 days", "Weekly"] }
    ]
  },
  {
    id: "n8n_workflow",
    name: "n8n Workflow",
    icon: "Workflow",
    description: "Architect valid n8n node structures and connection logic.",
    fields: [
      { name: "node_type", type: "select", options: ["HTTP Request", "Code", "Webhook", "Schedule", "Set"], required: true },
      { name: "logic_description", type: "textarea", required: true, placeholder: "Describe what this node should do..." },
      { name: "error_handling", type: "boolean", default: true }
    ]
  },
  {
    id: "api_mock",
    name: "API Request Mock",
    icon: "Server",
    description: "Generate structured JSON payloads for API development.",
    fields: [
      { name: "endpoint", type: "text", required: true, placeholder: "/v1/users" },
      { name: "method", type: "select", options: ["GET", "POST", "PUT", "DELETE"], default: "POST" },
      { name: "payload_structure", type: "json_editor", placeholder: '{"id": "uuid", "name": "string"}' }
    ]
  },
  {
    id: "custom",
    name: "Custom Architect",
    icon: "Code",
    description: "Build a completely custom technical JSON schema.",
    fields: [
      { name: "objective", type: "text", required: true, placeholder: "What are we forging?" },
      { name: "data_points", type: "dynamic_fields", description: "Add technical key-value requirements" }
    ]
  }
];

export const TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "n8n Webhook Listener",
    category_id: "n8n_workflow",
    description: "A secure webhook entry point for external data.",
    data: {
      node_type: "Webhook",
      logic_description: "Listen for POST requests on /data-ingest, expect JSON payload, respond with 200 OK immediately.",
      error_handling: true
    }
  },
  {
    id: "t2",
    name: "User Profile Mock",
    category_id: "api_mock",
    description: "Standardized user identity structure.",
    data: {
      endpoint: "/api/profile",
      method: "GET",
      payload_structure: {
        id: "PF-1024",
        username: "architect_one",
        role: "admin",
        settings: { notifications: true, theme: "dark" }
      }
    }
  }
];
