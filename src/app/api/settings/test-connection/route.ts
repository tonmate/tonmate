import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import OpenAI from 'openai';

interface TestConnectionRequest {
  provider: string;
  settings: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    cohereApiKey?: string;
    huggingFaceApiKey?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: TestConnectionRequest = await request.json();
    const { provider, settings } = body;

    let success = false;
    let error = '';

    try {
      switch (provider) {
        case 'openai':
          if (!settings.openaiApiKey) {
            throw new Error('OpenAI API key is required');
          }
          
          const openai = new OpenAI({
            apiKey: settings.openaiApiKey,
          });
          
          // Test with a simple completion
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 5,
          });
          
          success = !!response.choices[0]?.message?.content;
          break;

        case 'anthropic':
          if (!settings.anthropicApiKey) {
            throw new Error('Anthropic API key is required');
          }
          
          // Test Anthropic API
          const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': settings.anthropicApiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              max_tokens: 5,
              messages: [{ role: 'user', content: 'Hello' }]
            })
          });
          
          success = anthropicResponse.ok;
          if (!success) {
            const errorData = await anthropicResponse.json();
            throw new Error(errorData.error?.message || 'Anthropic API test failed');
          }
          break;

        case 'cohere':
          if (!settings.cohereApiKey) {
            throw new Error('Cohere API key is required');
          }
          
          // Test Cohere API
          const cohereResponse = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${settings.cohereApiKey}`
            },
            body: JSON.stringify({
              model: 'command',
              prompt: 'Hello',
              max_tokens: 5
            })
          });
          
          success = cohereResponse.ok;
          if (!success) {
            const errorData = await cohereResponse.json();
            throw new Error(errorData.message || 'Cohere API test failed');
          }
          break;

        case 'huggingface':
          if (!settings.huggingFaceApiKey) {
            throw new Error('Hugging Face API key is required');
          }
          
          // Test Hugging Face API with a simple model
          const hfResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.huggingFaceApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: 'Hello',
              parameters: {
                max_length: 10
              }
            })
          });
          
          success = hfResponse.ok;
          if (!success) {
            const errorData = await hfResponse.json();
            throw new Error(errorData.error || 'Hugging Face API test failed');
          }
          break;

        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (err: any) {
      error = err.message || 'Connection test failed';
      success = false;
    }

    return NextResponse.json({
      success,
      error: success ? null : error
    });

  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
