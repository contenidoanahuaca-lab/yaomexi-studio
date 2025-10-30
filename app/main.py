from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import os, requests

RESEND_KEY = os.getenv("RESEND_API_KEY")
PRODUCTS = {
  "guardian-colibri": "https://github.com/<org>/<repo>/releases/download/v1.0/guardian-colibri.zip"
}

class Order(BaseModel):
    email: EmailStr
    productId: str

app = FastAPI()

@app.post("/fulfill-yaomi")
def fulfill(order: Order):
    url = PRODUCTS.get(order.productId)
    if not url:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Enviar email (Resend)
    r = requests.post(
      "https://api.resend.com/emails",
      headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type":"application/json"},
      json={"from":"Yaomexicatl <no-reply@tu-dominio>",
            "to":[order.email],
            "subject":"Tu descarga Yaomexicatl",
            "html": f"¡Gracias por apoyar! Descarga tu pack: <a href='{url}'>aquí</a>."}
    )
    if r.status_code >= 300:
        raise HTTPException(status_code=500, detail="Error al enviar email")

    return {"ok": True, "downloadUrl": url}
