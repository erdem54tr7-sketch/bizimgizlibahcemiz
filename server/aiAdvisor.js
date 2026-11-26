function daysBetween(isoDateString) {
  if (!isoDateString) return null;
  const diffMs = Date.now() - new Date(isoDateString).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getGrowthStage(growthPoints, growthDaysRequired) {
  if (growthPoints <= 0) {
    return { stage: 0, label: 'Tohum Evresi', badge: '🌱 Tohum', progress: 0 };
  }
  const ratio = growthPoints / growthDaysRequired;
  if (ratio >= 1) {
    return { stage: 3, label: 'Tam Çiçek Açmış', badge: '🌺 Çiçek Açtı', progress: 100 };
  }
  if (ratio >= 0.6) {
    return { stage: 2, label: 'Tomurcuk Evresi', badge: '🌷 Tomurcuk', progress: Math.round(ratio * 100) };
  }
  return { stage: 1, label: 'Minik Filiz', badge: '🌿 Filiz', progress: Math.round(ratio * 100) };
}

export function buildRuleBasedAdvice({ pot, flower, wateredToday, latestNote }) {
  const stageInfo = getGrowthStage(pot.growth_points, pot.growth_days_required);
  const daysSince = daysBetween(pot.last_watered_at);
  const remainingSteps = Math.max(0, pot.growth_days_required - pot.growth_points);
  const interval = flower.waterIntervalDays;

  const lines = [];

  if (wateredToday) {
    const nextText = interval === 1 ? 'yarın' : `${interval} gün sonra`;
    lines.push(
      `Bugün bu güzelliği (${flower.name}) suladın! Harika gidiyorsun. Bir sonraki sulama için ${nextText} tekrar gelmelisin.`
    );
  } else if (daysSince === null) {
    lines.push(
      `${flower.name} tohumu henüz ilk suyunu bekliyor! Bugün "Bugün Sula" butonuna basarak onu sevgiyle uyandırabilirsin.`
    );
  } else if (daysSince >= interval) {
    lines.push(
      `Son sulamanın üzerinden ${daysSince} gün geçti ve toprağı nem özlemi çekiyor. Bugün onu sulaman için en ideal an!`
    );
  } else {
    const daysLeft = interval - daysSince;
    lines.push(
      `Toprağındaki nem hâlâ gayet dengeli (${pot.water_level}%). Bir sonraki sulama için ${daysLeft} gün daha beklemek köklerini mutlu eder.`
    );
  }

  if (stageInfo.stage === 3) {
    lines.push(
      `Tebrikler, ${flower.name} artık tam anlamıyla çiçek açtı! "${flower.languageOfFlowers}" enerjisini bahçeye yaymaya devam ediyor.`
    );
  } else if (remainingSteps === 1) {
    lines.push(`Tam çiçek açmasına sadece 1 sulama adımı kaldı; tomurcukları açmak üzere!`);
  } else {
    lines.push(
      `Şu an "${stageInfo.label}" aşamasında (${pot.growth_points}/${pot.growth_days_required}). Tam çiçek açması için ${remainingSteps} sulama günü daha gerekiyor.`
    );
  }

  if (pot.sun_exposure !== flower.sunlight) {
    lines.push(
      `Işık İpucu: ${flower.name} en çok "${flower.sunlight}" ortamını sever (şu an "${pot.sun_exposure}" konumunda). Işık konumunu güncellemeyi deneyebilirsin.`
    );
  }

  if (latestNote?.content) {
    const lower = latestNote.content.toLowerCase();
    if (lower.includes('yarın sulamayacağım') || lower.includes('sulamayacağım')) {
      lines.push(`Notunu gördüm! Dinlenme gününde toprağı fazla yormaman harika bir özen.`);
    } else if (lower.includes('suladım')) {
      lines.push(`Son bıraktığın sulama notunu kaydettim; bakım düzenin çok istikrarlı görünüyor.`);
    }
  }

  return {
    source: 'Flora AI (Bahçıvan Asistanı)',
    headline: wateredToday ? 'Sulama Tamamlandı ✨' : daysSince === null || daysSince >= interval ? 'Sulama Zamanı 💧' : 'Dengeli Nem 🌿',
    message: lines.join(' '),
    nextWaterInDays: wateredToday ? interval : daysSince === null ? 0 : Math.max(0, interval - daysSince),
  };
}

export async function generateAiAdvice(params) {
  const fallback = buildRuleBasedAdvice(params);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  try {
    const prompt = `Sen romantik bir sanal çiçek bahçesinin "Flora AI" adlı nazik bahçıvan danışmanısın.
Çiçek: ${params.flower.name} (${params.flower.latinName})
Su İhtiyacı: ${params.flower.waterNeed} (ideal aralık ${params.flower.waterIntervalDays} gün)
Güneş İhtiyacı: ${params.flower.sunlight} | Mevcut Konum: ${params.pot.sun_exposure}
Bugün sulandı mı: ${params.wateredToday ? 'Evet' : 'Hayır'}
Büyüme ilerlemesi: ${params.pot.growth_points}/${params.pot.growth_days_required}
Nem seviyesi: %${params.pot.water_level}
Kullanıcının son notu: ${params.latestNote?.content || 'Yok'}

2-3 kısa, samimi, romantik ve pratik Türkçe cümleyle sulama ve bakım tavsiyesi ver.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(4500),
      }
    );

    if (!res.ok) return fallback;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return fallback;

    return {
      ...fallback,
      source: 'Flora AI (Gemini)',
      message: text,
    };
  } catch {
    return fallback;
  }
}
