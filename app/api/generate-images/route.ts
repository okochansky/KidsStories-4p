import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { story } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured for image generation' },
        { status: 500 }
      );
    }

    if (!story || story.trim() === '') {
      return NextResponse.json(
        { error: 'Story is required for image generation' },
        { status: 400 }
      );
    }

    // Generate image prompts based on the story
    const imagePromptRequest = `Based on this children's story, create 3 detailed image prompts for cute, kid-friendly illustrations. Each prompt should be suitable for image generation and describe a key scene from the story.

Story: ${story}

Please provide exactly 3 image prompts in this format:
1. [First scene description]
2. [Second scene description] 
3. [Third scene description]

Make sure each prompt describes:
- Cute, colorful, kid-friendly style
- Specific characters and settings from the story
- Clear visual details
- Appropriate for children aged 5-12`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imagePromptResult = await model.generateContent(imagePromptRequest);
    const imagePromptResponse = await imagePromptResult.response;
    const imagePrompts = imagePromptResponse.text();

    // Parse the image prompts
    const promptLines = imagePrompts.split('\n').filter(line => line.match(/^\d+\./));
    const cleanPrompts = promptLines.map(line => line.replace(/^\d+\.\s*/, '').trim());

    // Generate actual images using DALL-E
    const images = await Promise.all(
      cleanPrompts.slice(0, 3).map(async (prompt, index) => {
        try {
          // Create enhanced prompts for kid-friendly image generation
          const enhancedPrompt = `Cute children's book illustration: ${prompt}. Digital art, bright pastel colors, friendly cartoon characters, wholesome and magical atmosphere, no scary elements, suitable for ages 5-12, storybook style.`;
          
          // Generate image using DALL-E
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            size: "1024x1024",
            quality: "standard",
            n: 1,
          });

          const imageUrl = imageResponse.data?.[0]?.url;
          
          if (!imageUrl) {
            throw new Error('No image URL received from DALL-E');
          }
          
          return {
            id: index + 1,
            prompt: enhancedPrompt,
            url: imageUrl,
            description: `Illustration ${index + 1}: ${prompt.substring(0, 50)}...`,
          };
        } catch (error) {
          console.error(`Error generating image ${index + 1}:`, error);
          // Return placeholder if image generation fails
          return {
            id: index + 1,
            prompt: prompt,
            url: `/placeholder.svg?height=300&width=400&text=Scene+${index + 1}`,
            description: `Illustration ${index + 1}: ${prompt.substring(0, 50)}...`,
          };
        }
      })
    );

    return NextResponse.json({ 
      images,
      imagePrompts: cleanPrompts
    });

  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: 'Failed to generate images. Please try again.' },
      { status: 500 }
    );
  }
} 