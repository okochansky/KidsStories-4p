import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { storyElements } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    if (!storyElements || storyElements.length === 0) {
      return NextResponse.json(
        { error: 'Story elements are required' },
        { status: 400 }
      );
    }

    // Filter out empty elements
    const validElements = storyElements.filter((element: string) => element.trim() !== '');
    
    if (validElements.length === 0) {
      return NextResponse.json(
        { error: 'At least one story element is required' },
        { status: 400 }
      );
    }

    // Create the prompt for Gemini
    const prompt = `Create a magical and engaging children's story that includes these elements: ${validElements.join(', ')}.

The story should be:
- Age-appropriate for children (5-12 years old)
- About 1000-1200 words long
- Have a positive message or moral
- Be engaging and imaginative
- Include all the provided elements in a meaningful way
- Have a clear beginning, middle, and end
- Use simple but rich language that children can understand

Please create a complete story with these elements woven naturally into the narrative.`;

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate the story
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const story = response.text();

    return NextResponse.json({ story });

  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story. Please try again.' },
      { status: 500 }
    );
  }
} 