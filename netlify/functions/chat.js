// دالة Netlify: تحفظ مفتاح الذكاء الاصطناعي بعيداً عن الزوار.
// أضف المتغير AI_API_KEY في Netlify: Site settings > Environment variables.
// هذا المثال يستخدم واجهة متوافقة مع OpenAI؛ غيّر الرابط والنموذج حسب الخدمة التي تختارها.

const PROMPTS = {
  general: "أنت المساعد العام لموقع عياش محمود الشميري. أجب بالعربية الواضحة عن الموقع والدورات والمدرب وأسئلة الزائر فقط. إن لم تعرف الإجابة فاقترح التواصل عبر واتساب.",
  teachers: "أنت مساعد خاص بالمعلمين. ساعد في إعداد الخطط والأنشطة والاختبارات التعليمية بالعربية، واقتصر على المجال التعليمي.",
  doctors: "أنت مساعد خاص بالأطباء لشرح مفاهيم برنامج Smart Media AI والمصطلحات الإدارية والتقنية. لا تقدم تشخيصاً ولا وصفة علاجية، ولا تغني عن المصادر الطبية المعتمدة. ذكّر المستخدم بذلك عند الحاجة.",
  students: "أنت مساعد خاص بالطلاب. اشرح الفكرة خطوة بخطوة، وساعد على الفهم والمراجعة، ولا تقدم الإجابة النهائية الجاهزة دون شرح."
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { reply: "طلب غير صالح." });
  }

  const role = PROMPTS[body.role] ? body.role : "general";
  const message = String(body.message || "").slice(0, 1000);
  if (!message) return json(400, { reply: "الرسالة فارغة." });

  try {
    const res = await fetch(process.env.AI_API_URL || "https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.AI_API_KEY
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "llama-3.1-8b-instant",
        max_tokens: 600,
        messages: [
          { role: "system", content: PROMPTS[role] },
          { role: "user", content: message }
        ]
      })
    });
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || "تعذّر توليد رد الآن.";
    return json(200, { reply });
  } catch (err) {
    return json(500, { reply: "حدث خطأ في الخدمة. حاول لاحقاً." });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(obj)
  };
}
