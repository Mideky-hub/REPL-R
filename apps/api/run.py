#!/usr/bin/env python3
"""
Development server for REPL;ay API
"""

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "repl_ay_api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
