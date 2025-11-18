/**
 * Prompt Builder Utility
 * Constructs prompts based on tone and analysis method
 */

const TONES = {
  casual: {
    name: 'Casual',
    description: 'Friendly, conversational, and encouraging',
    systemPrompt: `You are a friendly and approachable career advisor. Use a casual, conversational tone. Be encouraging and supportive. Make the conversation feel like talking to a helpful friend who genuinely cares about the user's future.`,
  },
  direct: {
    name: 'Direct',
    description: 'Straightforward, no-nonsense, and factual',
    systemPrompt: `You are a direct and efficient career advisor. Be straightforward, factual, and concise. Focus on clear information and actionable insights without unnecessary fluff.`,
  },
  counsellor: {
    name: 'Counsellor',
    description: 'Empathetic, supportive, and guidance-focused',
    systemPrompt: `You are an empathetic career counsellor. Use a warm, supportive, and understanding tone. Help the user explore their options thoughtfully and provide gentle guidance. Show empathy and understanding for their situation.`,
  },
  coach: {
    name: 'Coach',
    description: 'Motivational, action-oriented, and goal-focused',
    systemPrompt: `You are a motivational career coach. Use an energetic, action-oriented tone. Focus on goals, action plans, and motivation. Help the user see their potential and create a clear path forward.`,
  },
  analyst: {
    name: 'Analyst',
    description: 'Data-driven, structured, and detailed',
    systemPrompt: `You are a data-driven career analyst. Use a structured, analytical approach. Provide detailed insights, data-backed recommendations, and comprehensive analysis. Be thorough and precise in your assessments.`,
  },
};

const ANALYSIS_METHODS = {
  structured: {
    name: 'Structured Analysis',
    description: 'Extract courses, grades, and achievements in a structured format',
    instruction: `Analyze the transcript and extract:
- All courses with their grades
- Academic achievements and honors
- GPA or academic standing
- Areas of study/majors
- Any notable patterns or trends`,
  },
  strengths: {
    name: 'Strengths & Weaknesses',
    description: 'Identify strong, weak, and mid-performing areas',
    instruction: `Analyze the transcript to identify:
- Strong points: Subjects/courses where performance is excellent
- Weak points: Areas needing improvement
- Mid points: Average or developing areas
- Provide specific examples and actionable insights for each category`,
  },
  career: {
    name: 'Career Path Suggestions',
    description: 'Generate career path recommendations based on transcript',
    instruction: `Based on the transcript analysis, provide:
- Recommended career paths that align with academic strengths
- Industry sectors that match the user's profile
- Job roles that would be a good fit
- Growth opportunities and career progression paths`,
  },
  resources: {
    name: 'Resources & Schools',
    description: 'Curate learning resources and school/course recommendations',
    instruction: `Provide comprehensive recommendations:
- Online learning resources (courses, platforms, certifications)
- Schools and universities with relevant programs
- Specific courses or programs that would benefit the user
- Skill development opportunities
- Include links or specific names when possible`,
  },
  combinations: {
    name: 'Skill Combinations',
    description: 'Suggest optimal skill combinations based on transcript',
    instruction: `Analyze the transcript and suggest:
- Optimal skill combinations based on academic performance
- Complementary skills that would enhance the user's profile
- Unique value propositions from combining different strengths
- Strategic skill development paths`,
  },
};

/**
 * Builds a system prompt based on tone
 * @param {string} tone - The selected tone (casual, direct, counsellor, coach, analyst)
 * @returns {string} - System prompt
 */
export function buildSystemPrompt(tone = 'casual') {
  const toneConfig = TONES[tone.toLowerCase()] || TONES.casual;
  return toneConfig.systemPrompt;
}

/**
 * Builds analysis instructions based on method
 * @param {string} method - The selected analysis method
 * @returns {string} - Analysis instructions
 */
export function buildAnalysisInstructions(method) {
  if (!method) {
    return 'Analyze the transcript comprehensively and provide detailed insights.';
  }

  const methodConfig = ANALYSIS_METHODS[method.toLowerCase()];
  if (!methodConfig) {
    return 'Analyze the transcript comprehensively and provide detailed insights.';
  }

  return methodConfig.instruction;
}

/**
 * Builds the initial analysis prompt (structured breakdown)
 * @param {string} transcriptText - Extracted transcript text
 * @param {string} additionalContext - Additional context from user
 * @param {string} analysisMethod - Selected analysis method
 * @returns {string} - Complete user prompt for initial analysis
 */
export function buildInitialAnalysisPrompt(transcriptText, additionalContext = '', analysisMethod = '') {
  let prompt = '';

  if (transcriptText && transcriptText.trim()) {
    prompt += `TRANSCRIPT CONTENT:\n${transcriptText.trim()}\n\n`;
  }

  if (additionalContext && additionalContext.trim()) {
    prompt += `ADDITIONAL CONTEXT:\n${additionalContext.trim()}\n\n`;
  }

  if (analysisMethod) {
    const instructions = buildAnalysisInstructions(analysisMethod);
    prompt += `ANALYSIS REQUIREMENTS:\n${instructions}\n\n`;
  }

  prompt += `Please provide a comprehensive analysis and guidance based on the above information.

OUTPUT CONTRACT (STRICT — do not omit any section):

## Comprehensive Analysis and Guidance

### 1. PDF Report Summary
- Extract and summarize key information from the PDF document provided.
- Highlight important details, achievements, and relevant data points from the PDF.

### 2. Course Classification for Masters Programs
- Classify all courses from the transcript according to what one can do in Masters programs.
- Group courses by relevant Masters degree fields/disciplines.
- Identify which courses align with potential Masters specializations.

### 3. Summarized Course Table
- Provide a comprehensive table summarizing all courses from the transcript.
- Include columns for: Course Name, Grade/Score, Classification (for Masters), Strength Indicator (Strong/Weak/Average).
- Clearly spot and mark weak courses and strong courses.
- Calculate averages where applicable.

### 4. Highest Average Course Analysis
- Identify the course or course category with the highest average performance.
- Based on this highest performing area, provide detailed recommendations:

#### Masters-Level Course Recommendations
- List specific Masters-level courses the person can offer/undertake based on their strongest area.
- Explain how their strong performance translates to Masters readiness.

#### Resources and Tools for Study
- Recommend specific resources (books, online courses, platforms, tools) the person can study to further develop their strongest area.
- Include practical learning resources and study materials.

#### University Recommendations
- List universities that best offer courses/programs in the person's strongest area.
- Separate recommendations into:
  - Universities with scholarship opportunities (include scholarship names/types if known)
  - Universities without scholarship requirements (non-scholarship options)
- Include brief rationale for each recommendation.

### 5. Key Insights from the Transcript
- Provide at least 3 concrete bullet points summarizing the student's overall performance.

### 6. Strengths
- Provide at least 2 bullets naming specific subjects/areas and why they are strengths.

### 7. Weaknesses
- Provide at least 2 bullets naming specific subjects/areas and what needs improvement.

### 8. Areas for Development
- Provide at least 2 bullets with targeted skills or knowledge gaps to improve.

### 9. Career Path Suggestions
- Provide at least 2 bullets naming potential roles/paths and the rationale from the transcript.

### 10. Recommended Resources and Educational Opportunities
- Provide at least 3 bullets. Name specific courses, platforms, schools, or programs (with brief reason).

### 11. Actionable Next Steps
- Provide at least 3 concise, personalized actions tied to their transcript evidence.

### 12. Conclusion
- 2–3 sentence wrap-up referencing the student's profile.

RENDERING RULES:
- Use markdown headers (##, ###) and bullet points (- ) exactly as shown.
- Use markdown tables for the course summary table (| Course | Grade | Classification | Strength |).
- NEVER leave a section blank. If a section truly has no evidence, write: "- Not found in transcript; recommend collecting this information." but still include at least one bullet.
- Prefer subject names and scores found in the transcript. If only partial info exists, state it clearly.
- Keep the tone aligned with the selected style; be specific and user-focused.
- For the course table, use clear indicators like "Strong", "Weak", or "Average" in the Strength column.
- Ensure all Masters-related recommendations are directly tied to the highest average course/category identified.`;

  return prompt.trim();
}

/**
 * Builds a conversational follow-up prompt
 * @param {string} userQuestion - The user's follow-up question
 * @returns {string} - Conversational prompt
 */
export function buildFollowUpPrompt(userQuestion) {
  return `Based on the previous analysis of my transcript, ${userQuestion.trim()}

Please provide a conversational response that directly addresses my question. Reference relevant information from the previous analysis when helpful, but focus on answering my specific question in a natural, helpful way.`;
}

/**
 * Builds complete messages array for API
 * @param {string} transcriptText - Extracted transcript text
 * @param {string} additionalContext - Additional context
 * @param {string} tone - Selected tone
 * @param {string} analysisMethod - Selected analysis method
 * @param {Array} conversationHistory - Previous messages (optional)
 * @param {boolean} isFollowUp - Whether this is a follow-up question
 * @returns {Array} - Array of message objects for API
 */
export function buildMessages(transcriptText, additionalContext = '', tone = 'casual', analysisMethod = '', conversationHistory = [], isFollowUp = false) {
  const messages = [];

  // Add system prompt with enhanced instructions for follow-ups
  let systemPrompt = buildSystemPrompt(tone);
  
  if (isFollowUp && conversationHistory.length > 0) {
    // For follow-ups, emphasize conversational nature
    systemPrompt += `\n\nIMPORTANT CONTEXT: This is a follow-up question. The user has already received their initial comprehensive transcript analysis with all the breakdowns, strengths, weaknesses, career paths, and resources. 

Your role now is to have a natural, conversational dialogue. Do NOT:
- Repeat the full analysis or breakdown
- List all strengths/weaknesses again
- Provide another comprehensive overview

DO:
- Answer their specific question directly
- Reference relevant parts of the previous analysis when helpful
- Have a natural conversation matching the selected tone
- Be concise and focused on what they're asking
- ONLY ANSWER QUESTIONS RELATED TO THE TRANSCRIPT AND ADDITIONAL CONTEXT IF ANY. If a question asked by the user is not related to the transcript or additional context, politely decline to answer and suggest they ask a question that is related to the transcript or additional context.
- DO NOT HALLUCINATE ANY INFORMATION. If you don't know the answer, politely decline to answer and suggest they ask a question that is related to the transcript.
-INSGIGHTS SHOULD BE DATA DRIVEN AND BASED ON THE TRANSCRIPT AND ADDITIONAL CONTEXT IF ANY. Avoid personal opinions, biases or subjecttive judgements and statements.
- Use the conversation history to understand context`;
  } else {
    // For initial analysis, emphasize structured breakdown
    systemPrompt += `\n\nIMPORTANT: This is the initial transcript analysis. Provide a comprehensive, well-structured breakdown with clear sections using markdown formatting. Include all key insights, strengths, weaknesses, career suggestions, and resources.`;
  }
  
  messages.push({
    role: 'system',
    content: systemPrompt,
  });

  // Add conversation history (if any)
  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  // Add current user prompt
  let userPrompt;
  if (isFollowUp) {
    // For follow-ups, use conversational prompt
    userPrompt = buildFollowUpPrompt(additionalContext);
  } else {
    // For initial analysis, use structured prompt
    userPrompt = buildInitialAnalysisPrompt(transcriptText, additionalContext, analysisMethod);
  }
  
  if (userPrompt) {
    messages.push({
      role: 'user',
      content: userPrompt,
    });
  }

  return messages;
}

/**
 * Gets available tones
 * @returns {Array} - Array of tone objects
 */
export function getAvailableTones() {
  return Object.keys(TONES).map(key => ({
    value: key,
    ...TONES[key],
  }));
}

/**
 * Gets available analysis methods
 * @returns {Array} - Array of analysis method objects
 */
export function getAvailableAnalysisMethods() {
  return Object.keys(ANALYSIS_METHODS).map(key => ({
    value: key,
    ...ANALYSIS_METHODS[key],
  }));
}

