#!/usr/bin/env node
/**
 * Clinical Trials HTTP Server
 *
 * This HTTP server exposes the Clinical Trials MCP tools as REST API endpoints.
 * It wraps the MCP server functionality to provide HTTP access on port 5000.
 */
import express from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ClinicalTrialsServer } from './index.js';
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Create MCP server instance
const mcpServer = new ClinicalTrialsServer();
const server = mcpServer.getServer();
// Create a single HTTP transport and connect it to the MCP server
const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: process.env.ENABLE_JSON_RESPONSE === 'false' ? false : true,
});
// Connect once so incoming HTTP requests are routed to the MCP server
await server.connect(transport);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Clinical Trials MCP Server',
        version: '0.1.0',
        timestamp: new Date().toISOString()
    });
});
// List all available tools
app.get('/tools', (req, res) => {
    res.json({
        tools: [
            {
                name: 'search_studies',
                description: 'Search for clinical trials with various filters',
                endpoint: '/api/search_studies',
                method: 'POST'
            },
            {
                name: 'get_study_details',
                description: 'Get detailed information about a specific clinical trial',
                endpoint: '/api/get_study_details',
                method: 'POST'
            },
            {
                name: 'search_by_location',
                description: 'Find clinical trials by geographic location',
                endpoint: '/api/search_by_location',
                method: 'POST'
            },
            {
                name: 'search_by_condition',
                description: 'Search for clinical trials focusing on specific medical conditions',
                endpoint: '/api/search_by_condition',
                method: 'POST'
            },
            {
                name: 'get_trial_statistics',
                description: 'Get aggregate statistics about clinical trials',
                endpoint: '/api/get_trial_statistics',
                method: 'POST'
            },
            {
                name: 'search_by_sponsor',
                description: 'Search clinical trials by sponsor or organization',
                endpoint: '/api/search_by_sponsor',
                method: 'POST'
            },
            {
                name: 'search_by_intervention',
                description: 'Search clinical trials by intervention or treatment type',
                endpoint: '/api/search_by_intervention',
                method: 'POST'
            },
            {
                name: 'get_recruiting_studies',
                description: 'Get currently recruiting clinical trials with contact information',
                endpoint: '/api/get_recruiting_studies',
                method: 'POST'
            },
            {
                name: 'search_by_date_range',
                description: 'Search clinical trials by start or completion date range',
                endpoint: '/api/search_by_date_range',
                method: 'POST'
            },
            {
                name: 'get_studies_with_results',
                description: 'Find completed clinical trials that have published results',
                endpoint: '/api/get_studies_with_results',
                method: 'POST'
            },
            {
                name: 'search_rare_diseases',
                description: 'Search clinical trials for rare diseases and orphan conditions',
                endpoint: '/api/search_rare_diseases',
                method: 'POST'
            },
            {
                name: 'get_pediatric_studies',
                description: 'Find clinical trials specifically designed for children and adolescents',
                endpoint: '/api/get_pediatric_studies',
                method: 'POST'
            },
            {
                name: 'get_similar_studies',
                description: 'Find clinical trials similar to a specific study by NCT ID',
                endpoint: '/api/get_similar_studies',
                method: 'POST'
            },
            {
                name: 'search_by_primary_outcome',
                description: 'Search clinical trials by primary outcome measures or endpoints',
                endpoint: '/api/search_by_primary_outcome',
                method: 'POST'
            },
            {
                name: 'search_by_eligibility_criteria',
                description: 'Advanced search based on detailed eligibility criteria',
                endpoint: '/api/search_by_eligibility_criteria',
                method: 'POST'
            },
            {
                name: 'get_study_timeline',
                description: 'Get detailed timeline and milestone information for studies',
                endpoint: '/api/get_study_timeline',
                method: 'POST'
            },
            {
                name: 'search_international_studies',
                description: 'Find multi-country international clinical trials',
                endpoint: '/api/search_international_studies',
                method: 'POST'
            }
        ]
    });
});
// Generic tool handler
async function handleToolCall(toolName, args, res) {
    try {
        let result;
        switch (toolName) {
            case 'search_studies':
                result = await mcpServer.handleSearchStudies(args);
                break;
            case 'get_study_details':
                result = await mcpServer.handleGetStudyDetails(args);
                break;
            case 'search_by_location':
                result = await mcpServer.handleSearchByLocation(args);
                break;
            case 'search_by_condition':
                result = await mcpServer.handleSearchByCondition(args);
                break;
            case 'get_trial_statistics':
                result = await mcpServer.handleGetTrialStatistics(args);
                break;
            case 'search_by_sponsor':
                result = await mcpServer.handleSearchBySponsor(args);
                break;
            case 'search_by_intervention':
                result = await mcpServer.handleSearchByIntervention(args);
                break;
            case 'get_recruiting_studies':
                result = await mcpServer.handleGetRecruitingStudies(args);
                break;
            case 'search_by_date_range':
                result = await mcpServer.handleSearchByDateRange(args);
                break;
            case 'get_studies_with_results':
                result = await mcpServer.handleGetStudiesWithResults(args);
                break;
            case 'search_rare_diseases':
                result = await mcpServer.handleSearchRareDiseases(args);
                break;
            case 'get_pediatric_studies':
                result = await mcpServer.handleGetPediatricStudies(args);
                break;
            case 'get_similar_studies':
                result = await mcpServer.handleGetSimilarStudies(args);
                break;
            case 'search_by_primary_outcome':
                result = await mcpServer.handleSearchByPrimaryOutcome(args);
                break;
            case 'search_by_eligibility_criteria':
                result = await mcpServer.handleSearchByEligibilityCriteria(args);
                break;
            case 'get_study_timeline':
                result = await mcpServer.handleGetStudyTimeline(args);
                break;
            case 'search_international_studies':
                result = await mcpServer.handleSearchInternationalStudies(args);
                break;
            default:
                return res.status(404).json({ error: `Unknown tool: ${toolName}` });
        }
        // Parse the MCP response format
        if (result.content && result.content[0] && result.content[0].text) {
            const data = JSON.parse(result.content[0].text);
            res.json({
                success: true,
                tool: toolName,
                data: data,
                isError: result.isError || false
            });
        }
        else {
            res.json({
                success: true,
                tool: toolName,
                data: result,
                isError: result.isError || false
            });
        }
    }
    catch (error) {
        console.error(`Error in ${toolName}:`, error);
        res.status(500).json({
            success: false,
            tool: toolName,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}
// API endpoints for each tool
app.post('/api/search_studies', (req, res) => {
    handleToolCall('search_studies', req.body, res);
});
app.post('/api/get_study_details', (req, res) => {
    handleToolCall('get_study_details', req.body, res);
});
app.post('/api/search_by_location', (req, res) => {
    handleToolCall('search_by_location', req.body, res);
});
app.post('/api/search_by_condition', (req, res) => {
    handleToolCall('search_by_condition', req.body, res);
});
app.post('/api/get_trial_statistics', (req, res) => {
    handleToolCall('get_trial_statistics', req.body, res);
});
app.post('/api/search_by_sponsor', (req, res) => {
    handleToolCall('search_by_sponsor', req.body, res);
});
app.post('/api/search_by_intervention', (req, res) => {
    handleToolCall('search_by_intervention', req.body, res);
});
app.post('/api/get_recruiting_studies', (req, res) => {
    handleToolCall('get_recruiting_studies', req.body, res);
});
app.post('/api/search_by_date_range', (req, res) => {
    handleToolCall('search_by_date_range', req.body, res);
});
app.post('/api/get_studies_with_results', (req, res) => {
    handleToolCall('get_studies_with_results', req.body, res);
});
app.post('/api/search_rare_diseases', (req, res) => {
    handleToolCall('search_rare_diseases', req.body, res);
});
app.post('/api/get_pediatric_studies', (req, res) => {
    handleToolCall('get_pediatric_studies', req.body, res);
});
app.post('/api/get_similar_studies', (req, res) => {
    handleToolCall('get_similar_studies', req.body, res);
});
app.post('/api/search_by_primary_outcome', (req, res) => {
    handleToolCall('search_by_primary_outcome', req.body, res);
});
app.post('/api/search_by_eligibility_criteria', (req, res) => {
    handleToolCall('search_by_eligibility_criteria', req.body, res);
});
app.post('/api/get_study_timeline', (req, res) => {
    handleToolCall('get_study_timeline', req.body, res);
});
app.post('/api/search_international_studies', (req, res) => {
    handleToolCall('search_international_studies', req.body, res);
});
app.post('/', async (req, res) => {
    try {
        await transport.handleRequest(req, res, req.body);
    }
    catch {
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: 'Internal server error' },
                id: null,
            });
        }
    }
});
// Streamable HTTP GET (SSE stream) endpoint
app.get('/', async (req, res) => {
    try {
        await transport.handleRequest(req, res, undefined);
    }
    catch {
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: 'Internal server error' },
                id: null,
            });
        }
    }
});
// Optional: session cleanup (no-op in stateless mode)
app.delete('/', async (req, res) => {
    try {
        await transport.handleRequest(req, res, undefined);
    }
    catch {
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: 'Internal server error' },
                id: null,
            });
        }
    }
});
// Root endpoint with API documentation
app.get('/', (req, res) => {
    res.json({
        service: 'Clinical Trials MCP Server',
        version: '0.1.0',
        description: 'HTTP API wrapper for Clinical Trials MCP tools',
        endpoints: {
            health: 'GET /health',
            tools: 'GET /tools',
            api: 'POST /api/{tool_name}'
        },
        examples: {
            search_studies: {
                url: 'POST /api/search_studies',
                body: {
                    condition: 'cancer',
                    phase: 'PHASE3',
                    status: 'RECRUITING',
                    pageSize: 10
                }
            },
            get_study_details: {
                url: 'POST /api/get_study_details',
                body: {
                    nctId: 'NCT05882279'
                }
            }
        }
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: ['GET /', 'GET /health', 'GET /tools', 'POST /api/*']
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Clinical Trials MCP Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Available tools: http://localhost:${PORT}/tools`);
    console.log(`API documentation: http://localhost:${PORT}/`);
});
export default app;
