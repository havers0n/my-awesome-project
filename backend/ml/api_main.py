from fastapi import FastAPI, Request, Body
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

app = FastAPI()

@app.post("/forecast")
async def forecast(payload: list = Body(...)):
    logging.info(f"=== ML SERVICE: Received forecast request ===")
    logging.info(f"Payload length: {len(payload)}")
    logging.info(f"First item: {payload[0] if payload else 'Empty'}")
    logging.info(f"Sample data items: {payload[1:3] if len(payload) > 1 else 'No data'}")
    # Process the payload here
    return {"message": "Forecast processed"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error(f"=== VALIDATION ERROR ===")
    logging.error(f"URL: {request.url}")
    logging.error(f"Errors: {exc.errors()}")
    logging.error(f"Body: {exc.body}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)}
    )

# Example function where logging can be added
async def process_data(sales):
    # After converting to DataFrame
    logging.info(f"Successfully converted {len(sales)} sales records to DataFrame")
    
    # After feature generation
    df_feat = []  # Example placeholder
    logging.info(f"Generated features for {len(df_feat)} records")

    # After prediction
    period_pred = []  # Example placeholder
    logging.info(f"Generated predictions for {len(period_pred)} items")
