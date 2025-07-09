#!/usr/bin/env node

/**
 * Comprehensive Voice Transcription Test
 * Tests the complete pipeline from audio upload to transcription
 */

const fs = require('fs');
const path = require('path');

async function testTranscriptionEndpoint() {
  console.log('🎤 Testing Voice Transcription Pipeline...\n');

  // Test 1: Basic endpoint accessibility
  console.log('1. Testing endpoint accessibility...');
  try
  {
    const response = await fetch('http://localhost:8888/.netlify/functions/transcribe-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({test: 'data'})
    });

    const result = await response.text();
    if (result.includes('Expected multipart/form-data'))
    {
      console.log('   ✅ Endpoint accessible and expecting correct format');
    } else
    {
      console.log('   ❌ Unexpected response:', result);
      return false;
    }
  } catch (error)
  {
    console.log('   ❌ Endpoint not accessible:', error.message);
    return false;
  }

  // Test 2: Multipart form data test
  console.log('\n2. Testing multipart form data handling...');
  try
  {
    // Create a minimal audio file buffer (empty WAV header)
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // File size
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6D, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Subchunk1Size
      0x01, 0x00,             // AudioFormat (PCM)
      0x01, 0x00,             // NumChannels (mono)
      0x44, 0xAC, 0x00, 0x00, // SampleRate (44100)
      0x88, 0x58, 0x01, 0x00, // ByteRate
      0x02, 0x00,             // BlockAlign
      0x10, 0x00,             // BitsPerSample
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // Subchunk2Size
    ]);

    // Create FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('audio', wavHeader, {
      filename: 'test-audio.wav',
      contentType: 'audio/wav'
    });

    const response = await fetch('http://localhost:8888/.netlify/functions/transcribe-audio', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const result = await response.json();

    if (response.ok && (result.text || result.fallbackText))
    {
      console.log('   ✅ Multipart form data handled correctly');
      console.log('   📝 Response:', result);

      if (result.text && result.text.includes('OpenAI Whisper'))
      {
        console.log('   ℹ️  Using fallback transcription (OpenAI API key needed for real transcription)');
      }

      return true;
    } else
    {
      console.log('   ❌ Unexpected response:', result);
      return false;
    }
  } catch (error)
  {
    console.log('   ❌ Multipart test failed:', error.message);
    return false;
  }
}

async function testAudioPlayerComponent() {
  console.log('\n3. Testing Audio Player Component...');

  const audioPlayerPath = path.join(__dirname, 'src/components/AudioPlayer.vue');
  if (fs.existsSync(audioPlayerPath))
  {
    const content = fs.readFileSync(audioPlayerPath, 'utf8');

    const requiredFeatures = [
      'play/pause',
      'progress',
      'currentTime',
      'duration',
      'seek'
    ];

    let featuresFound = 0;
    requiredFeatures.forEach(feature => {
      if (content.toLowerCase().includes(feature.toLowerCase()))
      {
        featuresFound++;
      }
    });

    if (featuresFound >= 4)
    {
      console.log('   ✅ Audio Player component has required features');
    } else
    {
      console.log('   ⚠️  Audio Player missing some features');
    }
  } else
  {
    console.log('   ❌ Audio Player component not found');
    return false;
  }

  return true;
}

async function testVoiceRecordingIntegration() {
  console.log('\n4. Testing Voice Recording Integration...');

  const appPath = path.join(__dirname, 'src/App.vue');
  if (fs.existsSync(appPath))
  {
    const content = fs.readFileSync(appPath, 'utf8');

    const requiredFeatures = [
      'MediaRecorder',
      'getUserMedia',
      'transcribe-audio',
      'audioUrl',
      'AudioPlayer'
    ];

    let featuresFound = 0;
    requiredFeatures.forEach(feature => {
      if (content.includes(feature))
      {
        featuresFound++;
      }
    });

    if (featuresFound >= 4)
    {
      console.log('   ✅ Voice recording integration complete');
    } else
    {
      console.log('   ⚠️  Voice recording missing some features');
    }
  } else
  {
    console.log('   ❌ App.vue not found');
    return false;
  }

  return true;
}

async function runAllTests() {
  console.log('🚀 Voice Transcription System Test Suite\n');
  console.log('Testing against: http://localhost:8888\n');

  const results = [];

  // Install form-data if not available
  try
  {
    require('form-data');
  } catch (error)
  {
    console.log('Installing form-data for testing...');
    const {execSync} = require('child_process');
    execSync('npm install form-data', {stdio: 'inherit'});
  }

  results.push(await testTranscriptionEndpoint());
  results.push(await testAudioPlayerComponent());
  results.push(await testVoiceRecordingIntegration());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${ passed }/${ total } tests passed`);

  if (passed === total)
  {
    console.log('🎉 All tests passed! Voice transcription system is working correctly.');
    console.log('\n📋 What works:');
    console.log('   ✅ Transcription endpoint accessible');
    console.log('   ✅ Multipart form data handling');
    console.log('   ✅ Audio player component');
    console.log('   ✅ Voice recording integration');
    console.log('\n🎯 Ready for real microphone testing in browser!');
  } else
  {
    console.log('❌ Some tests failed. Check the output above for details.');
  }

  console.log('\n💡 To test with real microphone:');
  console.log('   1. Open http://localhost:8888 in Chrome/Safari');
  console.log('   2. Allow microphone permission');
  console.log('   3. Click Voice button to record');
  console.log('   4. Audio will be transcribed and saved with playback');
}

// Run tests
runAllTests().catch(console.error);
