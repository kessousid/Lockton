from config import settings
import json

# Gracefully handle missing OpenAI
try:
    from openai import OpenAI
    HAS_OPENAI = bool(settings.OPENAI_API_KEY)
except ImportError:
    HAS_OPENAI = False


def get_ai_client():
    if not HAS_OPENAI:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def chat_with_assistant(message: str, context: str = "") -> str:
    client = get_ai_client()
    if not client:
        return _fallback_response(message)
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are an insurance assistant for Lockton. Help with insurance questions, policy analysis, and risk assessment. Context: {context}"},
                {"role": "user", "content": message},
            ],
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception:
        return _fallback_response(message)


def analyze_document(text: str) -> dict:
    client = get_ai_client()
    if not client:
        return {"summary": "AI analysis unavailable. Please configure OpenAI API key.", "key_points": [], "risk_factors": []}
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Analyze this insurance document. Return JSON with: summary, key_points (array), risk_factors (array), coverage_gaps (array)."},
                {"role": "user", "content": text[:4000]},
            ],
            max_tokens=1000,
        )
        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            return {"summary": response.choices[0].message.content, "key_points": [], "risk_factors": []}
    except Exception:
        return {"summary": "Analysis failed.", "key_points": [], "risk_factors": []}


def predict_risk(client_data: dict) -> dict:
    client = get_ai_client()
    if not client:
        return _fallback_risk_prediction(client_data)
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a risk analyst. Analyze client data and return JSON with: risk_score (0-100), retention_risk (low/medium/high), factors (array of strings), recommendations (array of strings)."},
                {"role": "user", "content": json.dumps(client_data)},
            ],
            max_tokens=500,
        )
        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            return _fallback_risk_prediction(client_data)
    except Exception:
        return _fallback_risk_prediction(client_data)


def _fallback_response(message: str) -> str:
    msg = message.lower()
    if "coverage" in msg or "policy" in msg:
        return "I can help with coverage questions. To get detailed policy information, please check the Policies section. For specific client coverage, visit the Client detail page."
    if "claim" in msg:
        return "For claims assistance, visit the Claims section to file or track claims. You can view claim status, upload documents, and track resolution timelines."
    if "renewal" in msg:
        return "Check the Renewals section for upcoming renewals. You can view the renewal pipeline, set reminders, and track renewal status."
    if "risk" in msg:
        return "Risk assessments are available on client detail pages. Our AI model considers industry, claims history, policy coverage, and market factors."
    return "I'm your Lockton insurance assistant. I can help with policy questions, claims guidance, renewal tracking, and risk assessments. Try asking about a specific topic!"


def _fallback_risk_prediction(client_data: dict) -> dict:
    score = 50
    industry = client_data.get("industry", "").lower()
    if industry in ["construction", "mining", "oil_gas"]:
        score += 20
    elif industry in ["technology", "consulting", "finance"]:
        score -= 10
    revenue = client_data.get("annual_revenue", 0)
    if revenue > 10000000:
        score -= 5
    risk = "low" if score < 40 else "medium" if score < 70 else "high"
    return {
        "risk_score": min(max(score, 0), 100),
        "retention_risk": risk,
        "factors": ["Industry risk profile", "Revenue size", "Claims history"],
        "recommendations": ["Review coverage limits", "Consider umbrella policy", "Schedule quarterly review"],
    }
