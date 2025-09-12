// INTERFACE TYPE USED AS MODEL FOR HTTP RESPONSE RETURNED FROM .NET CORE API
// REFERENCED IN AGENT.TS FILE
export interface responseType {
    statusCode: number
    message: string
    data: []
}