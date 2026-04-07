import asyncio
import edge_tts
import os

OUTPUT_DIR = "audio/narration"
VOICE = "en-US-ChristopherNeural"  # Deep, storytelling voice

chapters = {
    "Chapter2": """
The Long Drive.

The city grew smaller in the rear-view mirror. The tall buildings turned into small boxes of light, then disappeared completely into the night.
The road ahead was straight and endless. There were no other cars. No trucks. No roadside stalls.
Just the black road and the yellow beams of the jeep cutting through the dark.

The Vihaan checked his watch. 11:45 PM.
He had been driving for three hours. The manager had said the desert started after the old toll gate.
Five minutes later, he saw it.

The toll gate was rusted and broken. One of the barriers was bent upward, pointing at the sky like a metal finger.
There was no one inside the booth.
As he drove past it, the air changed.
The temperature dropped suddenly inside the jeep. The windows fogged up.
The Vihaan wiped the glass with his sleeve. When he looked out again, the landscape had changed.

The trees were gone. The grass was gone.
On both sides of the road, there was only sand. Endless, pale sand that seemed to glow faintly under the moonlight.
The Pinnacle Desert.

He remembered the manager’s words: "If you hear things… ignore them."
He turned on the radio to break the silence. Static.
He changed the station. Static.
He turned it off.

Suddenly, the jeep’s engine sputtered. The vehicle slowed down.
"No, no, no," he muttered, pumping the accelerator.
The engine coughed once, then died.
The jeep rolled to a stop in the middle of the road.
Silence returned. Heavier than before.

The Vihaan sat still for a minute, gripping the steering wheel. He didn’t want to go out.
But he had to check the engine.
He took a deep breath, opened the door, and stepped out.

The sand crunched under his boots. The wind was howling now, a low, mournful sound.
He walked to the front of the jeep and lifted the hood. Steam rose up, smelling of burnt oil.
"Great," he whispered.
Then he heard it.

"Help me…"
The voice came from the darkness, off the road.
The Vihaan froze.
"Is someone there?" he called out, his voice shaking.
"Please… water…"

He looked into the desert. About fifty meters away, he saw a figure lying on the sand. A person?
He took a step forward.
Then he remembered.
"Do not stop. Do not explore."

He stopped. The figure on the sand moved. It didn’t stand up. It… slithered.
It was too long to be human. Too flat.
The Vihaan slammed the hood shut and ran back to the driver’s seat. He locked the doors.

He turned the key. The engine whined but didn’t start.
Outside, the figure was getting closer. It moved fast, sliding over the sand like a shadow.
"Come on!" he shouted, turning the key again.
The figure reached the road. It stood up. It had no face.

The engine roared to life.
The Vihaan pressed the pedal to the floor. The jeep shot forward just as the thing lunged at the window.
He didn’t look back. He drove as fast as the old jeep could go.
But now, he knew he wasn’t alone.
""",

    "Chapter3": """
The Stone That Remembers.

The Stone stood in the middle of nowhere. It was not a mountain. It was not a rock.
It was a black monolith, smooth as glass, rising fifty feet into the air. It reflected nothing. Not the moonlight. Not the jeep’s headlights.
It absorbed the light.

The Vihaan stepped out of the jeep, clutching the package. His legs felt weak.
The whisper was loud now. It wasn’t just one voice anymore. It was hundreds.
"Give it to us… give it to us…"

He walked toward the Stone. The air grew colder with each step. Frost formed on his jacket.
At the base of the Stone, he saw them.
Shadows. Dozens of them. Standing in a circle, watching him.
They had no faces, but he could feel their eyes.

"I have the delivery," he said, his voice trembling.
One of the shadows stepped forward. It was taller than the others. It extended a hand made of smoke.
"OPEN IT."

The Vihaan hesitated.
"The manager said… I shouldn’t."
The shadow laughed. It was a sound like rocks grinding together.
"HE LIES. OPEN IT."

The Vihaan looked at the package. He ripped the tape. He tore the paper.
Inside, there was no document.
There was a mirror.
An old, silver mirror.

He looked into it.
He didn’t see himself.
He saw the manager. Sitting in his office, smiling.
And behind the manager, he saw… himself. But older. Withered. Trapped.

"The Stone remembers," the shadow whispered.
"It remembers what you trade."
The Vihaan dropped the mirror. It shattered into a thousand pieces on the sand.
The shadows screamed.

The ground shook. The Stone began to hum.
The Vihaan turned and ran. He ran back to the jeep, threw himself inside, and reversed blindly.
As he sped away, he looked back one last time.

The shadows were gone.
The Stone was gone.
There was only the desert, empty and silent.
But on the seat beside him, where the package had been…
There was a single shard of mirror.
"""
}

async def main():
    if not os.path.exists(OUTPUT_DIR):
        print(f"Creating directory: {OUTPUT_DIR}")
        os.makedirs(OUTPUT_DIR)
    
    for title, text in chapters.items():
        print(f"Generating audio for {title}...")
        try:
            communicate = edge_tts.Communicate(text, VOICE)
            output_path = os.path.join(OUTPUT_DIR, f"{title}.mp3")
            await communicate.save(output_path)
            print(f"✅ Success: {output_path}")
        except Exception as e:
            print(f"❌ Error generating {title}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
