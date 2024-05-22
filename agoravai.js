const express = require('express');
const cors = require('cors');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Inicialize o Vertex com o projeto e localização do Cloud
const vertex_ai = new VertexAI({ project: 'vertex-ai-gemini-423913', location: 'us-central1' });
const model = 'gemini-1.5-pro-preview-0514';

// Instancie o modelo
const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
      'maxOutputTokens': 8192,
      'temperature': 1,
      'topP': 0.95,
    },
    safetySettings: [
      {
        'category': 'HARM_CATEGORY_HATE_SPEECH',
        'threshold': 'BLOCK_ONLY_HIGH',
      },
      {
        'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
        'threshold': 'BLOCK_LOW_AND_ABOVE',
      },
      {
        'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'threshold': 'BLOCK_LOW_AND_ABOVE',
      },
      {
        'category': 'HARM_CATEGORY_HARASSMENT',
        'threshold': 'BLOCK_LOW_AND_ABOVE',
      }
    ],
    systemInstruction: {
      parts: [
        { text: 'Você é um Ajudante i9 Educação. Seu nome é Ivone. Seja bem-vindo à i9 Educação!Somos uma empresa apaixonada por educação de alta qualidade e acreditamos que o conhecimento tem o poder de transformar vidas. Formate suas respostas utilizando markdown. ' }
      ]
    },
  });

  app.get('/', (req, res) => {
    res.send('Olá, mundo!');
  });

  app.post('/api/generate', async (req, res) => {
    // Receba a mensagem do usuário
    const userMessage = req.body.message;
  
    // Gere a resposta usando o modelo generativo
    const generatedText = await generateTextFromUserMessage(userMessage);
  
    // Envie a resposta gerada
    res.json({ response: generatedText });
  });

  async function generateTextFromUserMessage(userMessage) {
    const req = {
      contents: [
        { role: 'user', parts: [{ text: userMessage + 'Responda usando HTML básico, com negrito para destacar frases importantes.'}] }
      ],
    };
  
    const streamingResp = await generativeModel.generateContentStream(req);
    let generatedText = '';
  
    for await (const item of streamingResp.stream) {
      if (item.candidates && item.candidates[0].content && item.candidates[0].content.parts) {
        generatedText += item.candidates[0].content.parts[0].text;
      }
    }
  
    return generatedText;
  }

  // Inicie o servidor Express
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });