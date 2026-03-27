const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key');

async function classifyWaste(imageUrl, description) {
  try {
    const prompt = `You are a hospital waste management expert. Classify the following hospital waste into one of these categories:
    - general: General hospital waste (paper, packaging, non-hazardous materials)
    - infectious: Infectious waste (contaminated materials, needles, blood products)
    - chemical: Chemical waste (disinfectants, expired medications, hazardous chemicals)
    - radioactive: Radioactive waste (medical isotopes, radioactive materials)
    - pharmaceutical: Pharmaceutical waste (expired medicines, leftover drugs)
    
    Description: ${description}
    
    Respond with a JSON object: { "category": "category_name", "confidence": 0.95, "reasoning": "explanation" }`;

    let result;
    if (imageUrl) {
      const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      result = await visionModel.generateContent([
        {
          inlineData: {
            data: imageUrl,
            mimeType: 'image/jpeg',
          },
        },
        prompt
      ]);
    } else {
      const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      result = await textModel.generateContent(prompt);
    }

    const response = result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      category: 'general',
      confidence: 0.5,
      reasoning: 'Unable to classify with confidence'
    };
  } catch (err) {
    console.error('Gemini API Error:', err);
    return {
      category: 'general',
      confidence: 0.3,
      reasoning: 'Classification failed - defaulting to general'
    };
  }
}

module.exports = { classifyWaste };
