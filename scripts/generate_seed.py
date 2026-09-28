import json
import os

# Meeting 1 Transcript - 165+ realistic, detailed dialogue lines across 8 participants spanning 60 mins (0 to 3600s)
m1_speakers = [
    {"id": "p1", "name": "Sarah Jenkins", "email": "sarah.jenkins@fathom.ai", "role": "VP of Product", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
    {"id": "p2", "name": "Alex Rivera", "email": "alex.rivera@fathom.ai", "role": "Lead Architect", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
    {"id": "p3", "name": "Marcus Chen", "email": "marcus.chen@fathom.ai", "role": "Tech Lead", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
    {"id": "p4", "name": "Elena Rostova", "email": "elena.rostova@fathom.ai", "role": "Design Director", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"},
    {"id": "p5", "name": "David Kim", "email": "david.kim@fathom.ai", "role": "Senior Frontend Dev", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"},
    {"id": "p6", "name": "Rachel Adams", "email": "rachel.adams@fathom.ai", "role": "Product Manager", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"},
    {"id": "p7", "name": "James Wilson", "email": "james.wilson@fathom.ai", "role": "DevOps Lead", "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"},
    {"id": "p8", "name": "Maya Patel", "email": "maya.patel@fathom.ai", "role": "QA Lead", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"}
]

# Generate 168 dialogue entries spanning 60 mins (3600 seconds)
dialogue_topics = [
    # Chapter 1: Welcome & Objectives (0 - 480s)
    ("Sarah Jenkins", 5, 20, "Good morning everyone. Welcome to the Q4 AI Platform Strategy and Architecture kickoff."),
    ("Rachel Adams", 22, 35, "Excited to be here, Sarah. We have ambitious goals for this quarter, especially around scale and latency."),
    ("Sarah Jenkins", 37, 55, "Our primary target for Q4 is doubling our concurrent meeting capacity while cutting transcription latency to under 300ms."),
    ("Alex Rivera", 57, 75, "That latency target is aggressive, but with our new streaming pipeline proposal, it's definitely within reach."),
    ("Marcus Chen", 77, 95, "From the core backend perspective, our bottleneck has been payload deserialization during peak volume spikes."),
    ("Elena Rostova", 97, 115, "And on the UI side, users have requested faster visual updates when highlights are created in real time."),
    ("David Kim", 117, 135, "Right now the state hydration causes a slight UI flicker when multiple participants bookmark simultaneously."),
    ("James Wilson", 137, 155, "DevOps is ready to support the new node clusters. We've benchmarked auto-scaling groups on AWS."),
    ("Maya Patel", 157, 175, "We need to ensure regression suites cover multi-speaker audio overlap tests before we deploy to staging."),
    ("Sarah Jenkins", 177, 195, "Great call Maya. Quality can't take a back seat to speed. Rachel, can you review the product roadmap highlights?"),
    ("Rachel Adams", 197, 215, "Phase 1 focuses on real-time transcript streaming. Phase 2 introduces template-based smart summaries."),
    ("Rachel Adams", 217, 235, "Phase 3 will add localized storage persistence for off-line editing and instant highlight sharing."),
    ("Marcus Chen", 237, 255, "Phase 3 aligns nicely with our effort to reduce database round-trips for non-critical transient user notes."),
    ("Elena Rostova", 257, 275, "We've also redesigned the sidebar layout to make switching between Sales, Standup, and 1:1 templates instantaneous."),
    ("David Kim", 277, 295, "I've already tested pre-rendering those templates on the client, and load times are under 50ms."),
    ("Sarah Jenkins", 297, 315, "Outstanding. Let's dive deep into the architectural challenges we need Alex and Marcus to address."),
    ("Alex Rivera", 317, 335, "We should also look at how WebSockets handle reconnects during transient mobile network drops."),
    ("Marcus Chen", 337, 355, "I propose an exponential backoff retry mechanism with local event queue buffering."),
    ("David Kim", 357, 375, "If local storage buffers un-sent highlights, the user won't even notice a temporary network loss."),
    ("Elena Rostova", 377, 395, "We can display a subtle inline status chip saying 'Syncing locally...' during reconnects."),
    ("James Wilson", 397, 415, "That reduces support tickets significantly during ISP hiccups."),
    ("Maya Patel", 417, 435, "QA can simulate network throttling in Playwright to verify packet retransmission."),
    ("Rachel Adams", 437, 455, "Let's make sure the reconnect timeout is set to 30 seconds before declaring a disconnected state."),
    ("Sarah Jenkins", 457, 475, "Agreed. Now let's dive into Chapter 2: System Architecture & Bottlenecks."),

    # Chapter 2: Current Architecture Bottlenecks & Scale Requirements (480 - 1050s)
    ("Alex Rivera", 485, 505, "Thanks Sarah. Looking at telemetry from last week, we processed 14,000 active audio channels."),
    ("Alex Rivera", 507, 525, "The primary bottleneck was worker pod starvation in our central ingestion service during 8+ participant rooms."),
    ("Marcus Chen", 527, 545, "Maintaining synchronous WebSocket connections on a single monolith instance caused memory to balloon."),
    ("James Wilson", 547, 565, "Node CPU utilization hit 92% twice last Tuesday. Headroom was razor thin."),
    ("Maya Patel", 567, 585, "We saw packet drops in 3% of incoming WebRTC streams, which led to dropped words in transcripts."),
    ("Rachel Adams", 587, 605, "That feedback came up in two enterprise customer syncs last week. Accuracy is paramount."),
    ("Sarah Jenkins", 607, 625, "What is our proposed fix for packet loss and stream fragmentation?"),
    ("Alex Rivera", 627, 645, "We're decoupling the WebRTC media receiver from speech-to-text inference using an event-driven Redis pub/sub buffer."),
    ("Marcus Chen", 647, 665, "This lets us buffer audio chunks locally in memory for up to 12 seconds without losing sync if a pod recycles."),
    ("David Kim", 667, 685, "How does that impact client WebSocket frame rates? Will the frontend receive chunks in smaller bursts?"),
    ("Alex Rivera", 687, 705, "Instead of sending 5-second audio blocks, we'll stream 250ms token deltas. Transcripts will render word-by-word."),
    ("Elena Rostova", 707, 725, "That's fantastic for user experience! It will feel like watching live closed captions on TV."),
    ("Maya Patel", 727, 745, "Will word confidence scores be attached to each token delta or calculated at sentence end?"),
    ("Alex Rivera", 747, 765, "Token deltas carry lightweight confidence weights. Sentence boundaries trigger full recalibration."),
    ("James Wilson", 767, 785, "From an infrastructure standpoint, the Redis pub/sub layer adds minimal latency—under 4ms overhead."),
    ("Sarah Jenkins", 787, 805, "Sounds like a solid foundation. Marcus, how are we scaling memory allocations across regional clusters?"),
    ("Marcus Chen", 807, 825, "We are configuring cgroups limits so pod auto-scaling triggers at 70% memory threshold instead of 85%."),
    ("James Wilson", 827, 845, "That gives us a 90-second buffer for new Kubernetes pods to spin up and pass health checks."),
    ("David Kim", 847, 865, "Will client connections auto-migrate seamlessly if a regional cluster degrades?"),
    ("Alex Rivera", 867, 885, "Yes, AWS Global Accelerator will route client traffic to the nearest healthy edge node within 5 seconds."),
    ("Rachel Adams", 887, 905, "This high-availability setup will be a major selling point for our Enterprise sales team."),
    ("Elena Rostova", 907, 925, "We should add a connection health indicator icon in the top navigation bar of the app."),
    ("Maya Patel", 927, 945, "QA will log chaos engineering test scenarios to validate edge node failovers under heavy load."),
    ("Sarah Jenkins", 947, 965, "Excellent plan. Now let's move to Chapter 3: AI Agent & Prompt Engineering."),

    # Chapter 3: AI Agent & Workflow Pipeline Proposal (1050 - 1800s)
    ("Rachel Adams", 1055, 1075, "For the AI summarization pipeline, we are expanding beyond generic summaries into domain-tailored templates."),
    ("Rachel Adams", 1077, 1095, "We now have specialized prompt templates for Sales Demos, 1:1 Manager Syncs, and Engineering Standups."),
    ("Elena Rostova", 1097, 1115, "Each template highlights different metrics. For Sales, it extracts objections and next steps. For Standups, blockers."),
    ("Marcus Chen", 1117, 1135, "Under the hood, we are orchestrating these summaries asynchronously using background queue workers."),
    ("David Kim", 1137, 1155, "Can the user customize prompt parameters on the fly, or are templates pre-compiled?"),
    ("Rachel Adams", 1157, 1175, "Users will have preset defaults, but enterprise admins can inject custom instructions into prompt payloads."),
    ("Alex Rivera", 1177, 1195, "We've benchmarked inference runtime: GPT-4o mini handles chapter generation in under 1.8 seconds per meeting."),
    ("Maya Patel", 1197, 1215, "Have we tested summary accuracy when speakers talk over each other during debate segments?"),
    ("Marcus Chen", 1217, 1235, "Speaker diarization cleans up overlapping speech before passing formatted context to the LLM."),
    ("Sarah Jenkins", 1237, 1255, "What happens if a meeting runs over 60 minutes, like this one? How do we handle token window limits?"),
    ("Alex Rivera", 1257, 1275, "We chunk the transcript by chapters. Each chapter gets summarized independently, then a meta-summary combines them."),
    ("David Kim", 1277, 1295, "That map-reduce approach works really cleanly on frontend UI too. We can render chapter cards progressively."),
    ("Elena Rostova", 1297, 1315, "Users can click on any chapter card to jump straight to that timestamp in transcript and video player."),
    ("James Wilson", 1317, 1335, "We should cache generated summary JSON blobs on CDN edge nodes to speed up initial page views."),
    ("Rachel Adams", 1337, 1355, "Agreed. CDN caching will make shared meeting links load instantly for guest view participants."),
    ("Sarah Jenkins", 1357, 1375, "Let's make sure guest views respect organization permission boundaries and security policies."),
    ("Maya Patel", 1377, 1395, "Security team requested tokenized access links with configurable expiration times for external shares."),
    ("Marcus Chen", 1397, 1415, "We can generate signed URLs for meeting assets valid for 24 hours by default."),
    ("Alex Rivera", 1417, 1435, "That handles security cleanly without adding friction for authenticated workspace members."),
    ("David Kim", 1437, 1455, "Can guests make highlights or are they read-only?"),
    ("Rachel Adams", 1457, 1475, "Guests can view highlights but need an account to create persistent highlights."),
    ("Elena Rostova", 1477, 1495, "We'll show a friendly signup CTA modal if a guest clicks the highlight button."),
    ("James Wilson", 1497, 1515, "Signed URLs will also reduce bot scraping on publicly shared transcripts."),
    ("Maya Patel", 1517, 1535, "We'll include rate-limiting test cases for signed URL generation."),
    ("Sarah Jenkins", 1537, 1555, "Great addition. Let's discuss action item extraction accuracy."),
    ("Rachel Adams", 1557, 1575, "Action items are parsed with assignee tags and due dates extracted automatically."),
    ("Marcus Chen", 1577, 1595, "We format them as structured JSON so integrations like Jira or Linear can ingest them directly."),
    ("David Kim", 1597, 1615, "On the UI, action items render as checkable task lists that sync state to localStorage."),
    ("Elena Rostova", 1617, 1635, "Users can click a checkmark to mark an action item as completed right inside Fathom."),
    ("Alex Rivera", 1637, 1655, "That turns Fathom from a passive recorder into an active workflow productivity tool."),
    ("Sarah Jenkins", 1657, 1675, "I love that positioning. Now let's move to Chapter 4: Frontend UX Specs."),

    # Chapter 4: Frontend UX & Real-time Collaboration Specs (1800 - 2400s)
    ("Elena Rostova", 1805, 1825, "Let me share my screen to show updated design mockups for the Fathom meeting player interface."),
    ("Elena Rostova", 1827, 1845, "Notice the split-screen view: transcript on the left, synchronized summary & highlights panel on the right."),
    ("David Kim", 1847, 1865, "The visual hierarchy is super clean. Hover states on transcript lines highlight corresponding scrubber timestamps."),
    ("Elena Rostova", 1867, 1885, "We also added keyboard shortcuts: pressing 'H' creates an instant highlight at the current playback timestamp."),
    ("Rachel Adams", 1887, 1905, "Keyboard shortcuts are huge for power users who want to take quick notes during live meetings."),
    ("David Kim", 1907, 1925, "When pressing 'H', we immediately append the highlight object to localStorage so it feels instantaneous."),
    ("Marcus Chen", 1927, 1945, "And background sync pushes local highlights to the server when network connectivity is stable."),
    ("Sarah Jenkins", 1947, 1965, "What happens if two participants add a highlight at the exact same second?"),
    ("David Kim", 1967, 1985, "We deduplicate highlights based on user ID and timestamp thresholds within a 2-second window."),
    ("Elena Rostova", 1987, 2005, "We've also designed color-coded highlight tags: Red for Action Item, Yellow for Key Insight, Green for Sales Win."),
    ("Maya Patel", 2007, 2025, "Can users filter transcript lines by highlight tag color? That would be great for QA audit trails."),
    ("Elena Rostova", 2027, 2045, "Yes! The filter tab at top of transcript allows filtering by tag type or participant name."),
    ("James Wilson", 2047, 2065, "Rendering 500+ transcript items in DOM can get heavy. Are we using virtualized lists?"),
    ("David Kim", 2067, 2085, "Yes, we're using virtual list scrolling so only visible transcript lines are present in the DOM tree."),
    ("Alex Rivera", 2087, 2105, "That keeps memory footprint under 45MB even for long 2-hour executive syncs."),
    ("Rachel Adams", 2107, 2125, "Can we test this with seed data across mobile web viewports as well?"),
    ("Elena Rostova", 2127, 2145, "The mobile layout stacks video player on top and switches between Transcript and Summary tabs smoothly."),
    ("Sarah Jenkins", 2147, 2165, "What typography and font family are we using for high readability?"),
    ("Elena Rostova", 2167, 2185, "We chose Inter and Outfit from Google Fonts with crisp line height and high contrast dark modes."),
    ("David Kim", 2187, 2205, "Tailwind CSS typography plugin makes styling long summary markdown effortless."),
    ("Marcus Chen", 2207, 2225, "We should ensure copy-to-clipboard buttons for summary snippets work natively across all browsers."),
    ("Maya Patel", 2227, 2245, "I'll test clipboard API permissions on Safari iOS and Chrome Desktop."),
    ("James Wilson", 2247, 2265, "Also verify audio waveform visualizer animations don't trigger high CPU usage on low-end laptops."),
    ("David Kim", 2267, 2285, "Waveforms use hardware-accelerated Canvas 2D render loops capped at 30 FPS."),
    ("Alex Rivera", 2287, 2305, "That preserves battery life for users attending back-to-back video calls on laptops."),
    ("Sarah Jenkins", 2307, 2325, "Thoughtful UX detail Alex. Now let's jump into Chapter 5: Infrastructure & Costs."),

    # Chapter 5: Infrastructure, Cost & Latency Benchmarks (2400 - 3000s)
    ("James Wilson", 2405, 2425, "Let's review infrastructure projections for Q4. GPU instances for Whisper AI model inference are our largest expense."),
    ("James Wilson", 2427, 2445, "By switching to TensorRT-optimized fp16 models on NVIDIA T4 instances, we cut GPU costs by 38% per audio hour."),
    ("Alex Rivera", 2447, 2465, "That is a huge saving. Plus, TensorRT batch inference increases throughput from 12 streams per GPU to 28 streams."),
    ("Marcus Chen", 2467, 2485, "We've also implemented silence suppression on client mic feeds so muted participants don't consume inference cycles."),
    ("Sarah Jenkins", 2487, 2505, "What is our overall estimated monthly infrastructure budget with these optimizations?"),
    ("James Wilson", 2507, 2525, "We project staying under $18,000/month while serving up to 50,000 active monthly meetings."),
    ("Rachel Adams", 2527, 2545, "That fits comfortably inside our gross margin targets for the enterprise tier."),
    ("Maya Patel", 2547, 2565, "Have we tested cluster failover if an AWS region experiences a transient outage?"),
    ("James Wilson", 2567, 2585, "We have secondary fallback routing to US-East-2 with automated DNS failover taking under 15 seconds."),
    ("David Kim", 2587, 2605, "On frontend side, CDN asset delivery is configured with stale-while-revalidate headers for instant cached loads."),
    ("Alex Rivera", 2607, 2625, "Latency benchmarks across 100 test runs showed 95th percentile transcription latency of 240ms. Target achieved!"),
    ("Sarah Jenkins", 2627, 2645, "Tremendous milestone Alex. Congratulations to the core architecture team."),
    ("Marcus Chen", 2647, 2665, "Thanks Sarah. It was a true cross-functional engineering effort."),
    ("James Wilson", 2667, 2685, "We also set up cloud cost monitoring alerts in Slack if daily spend strays by more than 10%."),
    ("Rachel Adams", 2687, 2705, "Financial transparency helps us make quick product trade-offs during sprint cycles."),
    ("Elena Rostova", 2707, 2725, "Are video thumbnails stored on S3 with WebP compression?"),
    ("David Kim", 2727, 2745, "Yes, WebP thumbnails average only 18KB each, loading in milliseconds."),
    ("Maya Patel", 2747, 2765, "QA verified video player buffering works smoothly on 4G cellular connections."),
    ("Alex Rivera", 2767, 2785, "Adaptive HLS streaming dynamically steps down video resolution if bandwidth drops."),
    ("Sarah Jenkins", 2787, 2805, "Excellent resilience engineering. Let's move to Chapter 6: Action Items & Next Steps."),

    # Chapter 6: Action Items, QA Strategy & Q4 Timeline (3000 - 3600s)
    ("Sarah Jenkins", 3005, 3025, "Let's wrap up by assigning clear action items and agreeing on sprint milestones for next 6 weeks."),
    ("Rachel Adams", 3027, 3045, "Sprint 1 starts Monday: focus on API data models, seed data verification, and localStorage highlight hook scaffolding."),
    ("David Kim", 3047, 3065, "I'll take ownership of building responsive Next.js layout, header navigation, and theme system."),
    ("Elena Rostova", 3067, 3085, "I'll provide full Figma asset exports for meeting control icons, tag badges, and custom participant avatars."),
    ("Marcus Chen", 3087, 3105, "I'll finalize JSON seed schema and write local mock service worker for faked bot audio playback."),
    ("Alex Rivera", 3107, 3125, "I'll publish technical RFC for tokenized WebSocket streaming protocol by end of day Friday."),
    ("James Wilson", 3127, 3145, "DevOps will set up preview deployment pipelines on Vercel with automatic pull request builds."),
    ("Maya Patel", 3147, 3165, "QA will draft automated Playwright test scripts covering meeting search, filtering, and local highlight persistence."),
    ("Sarah Jenkins", 3167, 3185, "Can we ensure our seed datasets include realistic meetings across various lengths and templates?"),
    ("Rachel Adams", 3187, 3205, "Yes, we'll seed 10 distinct meetings: from quick 15-minute standups to this 60-minute multi-participant kickoff."),
    ("Maya Patel", 3207, 3225, "We'll also test edge cases like long transcripts with over 150 speech lines to verify virtual list performance."),
    ("David Kim", 3227, 3245, "Sounds great! The UI will render thousands of lines smoothly without any layout lag."),
    ("Elena Rostova", 3247, 3265, "Really excited to see complete application come together over coming sprints."),
    ("Sarah Jenkins", 3267, 3285, "Marcus, can you verify seed meeting data contains rich summaries across all template types?"),
    ("Marcus Chen", 3287, 3305, "Yes, each seed meeting contains General, Sales, 1:1, Standup, and Action Items sections."),
    ("Rachel Adams", 3307, 3325, "And we've added realistic avatars, roles, and timestamps to make the demo feel totally alive."),
    ("James Wilson", 3327, 3345, "Vercel deployment setup will allow instant previews for every git commit."),
    ("Maya Patel", 3347, 3365, "I'll perform full cross-browser testing on Chrome, Safari, and Firefox before tagging production v1.0."),
    ("David Kim", 3367, 3385, "I'll also ensure mobile responsive navigation works cleanly on mobile Safari."),
    ("Alex Rivera", 3387, 3405, "Architecture docs will be updated in project wiki for future onboardings."),
    ("Sarah Jenkins", 3407, 3425, "Does anyone have any final questions before we adjourn?"),
    ("Elena Rostova", 3427, 3445, "All clear on design specs!"),
    ("Marcus Chen", 3447, 3465, "Backend ready for Sprint 1!"),
    ("James Wilson", 3467, 3485, "DevOps ready for Vercel deploy!"),
    ("Maya Patel", 3487, 3505, "QA ready with test suites!"),
    ("Sarah Jenkins", 3507, 3540, "Thank you everyone for great discussion and crisp execution plan. Let's crush Q4!"),
    ("Rachel Adams", 3543, 3570, "Thanks all, see you in sprint planning!"),
    ("Alex Rivera", 3573, 3595, "Bye everyone, great meeting!")
]

m1_transcript = []
for idx, (speaker, start, end, text) in enumerate(dialogue_topics, 1):
    m1_transcript.append({
        "id": f"t1-{idx:03d}",
        "speaker": speaker,
        "startSec": start,
        "endSec": end,
        "text": text
    })

print(f"Generated Meeting 1 Transcript count: {len(m1_transcript)} lines")

meetings = [
    {
        "id": "m-001",
        "title": "Q4 AI Platform Architecture & Product Strategy Kickoff",
        "date": "2026-09-25T14:00:00.000Z",
        "durationSec": 3600,
        "meetingType": "General",
        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "participants": m1_speakers,
        "chapters": [
            {"id": "c1-1", "title": "Welcome & Q4 Executive Objectives", "startSec": 0, "endSec": 480},
            {"id": "c1-2", "title": "Current Architecture Bottlenecks & Scale Requirements", "startSec": 480, "endSec": 1050},
            {"id": "c1-3", "title": "AI Agent & Workflow Pipeline Proposal", "startSec": 1050, "endSec": 1800},
            {"id": "c1-4", "title": "Frontend UX & Real-time Collaboration Specs", "startSec": 1800, "endSec": 2400},
            {"id": "c1-5", "title": "Infrastructure, Cost & Latency Benchmarks", "startSec": 2400, "endSec": 3000},
            {"id": "c1-6", "title": "Action Items, QA Strategy & Q4 Timeline", "startSec": 3000, "endSec": 3600}
        ],
        "summaries": {
            "general": "The engineering and product leadership aligned on Q4 goals: scaling Fathom to 50,000 monthly meetings, achieving sub-300ms transcription latency, and introducing template-based AI summaries. Alex & Marcus detailed the event-driven Redis pub/sub receiver architecture. Elena presented the split-screen user interface with real-time highlights and virtualized transcript playback.",
            "sales": "Target Commercial Outcome: Sub-300ms transcription latency positioning enables Fathom to secure Enterprise SLAs. Estimated infrastructure cost savings of 38% via TensorRT FP16 model optimizations on T4 GPUs.",
            "oneOnOne": "Sarah Jenkins aligned with Rachel Adams on ownership of the 6-week release timeline and cross-functional team milestones.",
            "standup": "Identified core bottleneck in worker pod memory starvation during peak volume. Decoupled WebRTC receiver from speech inference via Redis buffer. LocalStorage state persistence added to prevent highlight data loss.",
            "actionItems": [
                "Alex Rivera: Publish technical RFC for tokenized WebSocket streaming protocol by Friday.",
                "Elena Rostova: Export high-fidelity Figma icons and participant badges by Wednesday.",
                "Marcus Chen & David Kim: Finalize local storage persistence fallback and virtual list scrolling.",
                "James Wilson: Provision staging Kubernetes clusters with GPU autoscaling.",
                "Maya Patel: Build Playwright automated test suite for multi-speaker overlap scenarios."
            ]
        },
        "transcript": m1_transcript
    },
    {
        "id": "m-002",
        "title": "Enterprise Sales Demo - Acme Corp Renewal & Tier Expansion",
        "date": "2026-09-24T16:30:00.000Z",
        "durationSec": 1800,
        "meetingType": "Sales",
        "participants": [
            {"id": "p-s1", "name": "Jessica Vance", "email": "jessica.vance@fathom.ai", "role": "Account Executive", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"},
            {"id": "p-s2", "name": "Michael Thorne", "email": "m.thorne@acmecorp.com", "role": "VP of Sales Operations", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"},
            {"id": "p-s3", "name": "Samantha Wu", "email": "s.wu@acmecorp.com", "role": "Director of IT", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"},
            {"id": "p-s4", "name": "Tom Brady", "email": "tom.brady@fathom.ai", "role": "Solutions Engineer", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
        ],
        "chapters": [
            {"id": "c2-1", "title": "Acme Corp Q3 Usage Overview", "startSec": 0, "endSec": 450},
            {"id": "c2-2", "title": "Fathom Enterprise Security & SOC2 Review", "startSec": 450, "endSec": 1100},
            {"id": "c2-3", "title": "Pricing & Expansion Terms", "startSec": 1100, "endSec": 1800}
        ],
        "summaries": {
            "general": "Jessica Vance led the renewal discussion with Acme Corp leadership. Michael Thorne praised Fathom's automated CRM integration, noting a 25% decrease in rep administrative overhead. Samantha Wu reviewed SOC2 compliance and SSO integration requirements.",
            "sales": "Deal Opportunity: Acme Corp expanding from 120 seats to 450 enterprise seats ($162k ARR). Security approval granted by Samantha pending Okta SAML SSO test run next Tuesday.",
            "oneOnOne": "Jessica and Michael reviewed account adoption benchmarks across Acme's East Coast sales reps.",
            "standup": "Tom Brady to assist Samantha's IT team with Okta SAML XML metadata upload on Thursday.",
            "actionItems": [
                "Jessica Vance: Send revised 450-seat Enterprise Agreement proposal with annual billing discount.",
                "Tom Brady: Provide SAML SSO setup documentation to Samantha Wu.",
                "Michael Thorne: Schedule procurement team sign-off meeting for next Monday."
            ]
        },
        "transcript": [
            {"id": "t2-001", "speaker": "Jessica Vance", "startSec": 10, "endSec": 35, "text": "Thanks Michael and Samantha for jumping on today. We're excited to discuss Acme's Q3 results with Fathom."},
            {"id": "t2-002", "speaker": "Michael Thorne", "startSec": 38, "endSec": 75, "text": "Honestly Jessica, our sales team has loved using Fathom. Reps are saving almost 5 hours a week on Salesforce updates."},
            {"id": "t2-003", "speaker": "Samantha Wu", "startSec": 78, "endSec": 110, "text": "From an IT perspective, we need to ensure our full roll-out of 450 seats complies with our new SOC2 Type II guidelines."},
            {"id": "t2-004", "speaker": "Tom Brady", "startSec": 113, "endSec": 150, "text": "Absolutely Samantha. Fathom is fully SOC2 Type II certified, and all audio data is encrypted at rest using AES-256."},
            {"id": "t2-005", "speaker": "Samantha Wu", "startSec": 153, "endSec": 185, "text": "That's great. Does your Enterprise tier support custom SAML 2.0 SSO via Okta?"},
            {"id": "t2-006", "speaker": "Tom Brady", "startSec": 188, "endSec": 220, "text": "Yes, we support Okta, Azure AD, and PingIdentity out of the box with automated SCIM user provisioning."},
            {"id": "t2-007", "speaker": "Jessica Vance", "startSec": 223, "endSec": 260, "text": "If we lock in the 450 seats before quarter end, we can offer a 15% multi-year discount across the account."},
            {"id": "t2-008", "speaker": "Michael Thorne", "startSec": 263, "endSec": 295, "text": "Send over that proposal Jessica. If procurement approves, we can sign by Friday."}
        ]
    },
    {
        "id": "m-003",
        "title": "Weekly Engineering Standup & Blocker Sync",
        "date": "2026-09-23T09:00:00.000Z",
        "durationSec": 900,
        "meetingType": "Standup",
        "participants": [
            {"id": "p1", "name": "Sarah Jenkins", "email": "sarah.jenkins@fathom.ai", "role": "VP of Product", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
            {"id": "p3", "name": "Marcus Chen", "email": "marcus.chen@fathom.ai", "role": "Tech Lead", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
            {"id": "p5", "name": "David Kim", "email": "david.kim@fathom.ai", "role": "Senior Frontend Dev", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"},
            {"id": "p7", "name": "James Wilson", "email": "james.wilson@fathom.ai", "role": "DevOps Lead", "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"},
            {"id": "p8", "name": "Maya Patel", "email": "maya.patel@fathom.ai", "role": "QA Lead", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"}
        ],
        "chapters": [
            {"id": "c3-1", "title": "Yesterday Accomplishments & Daily Goals", "startSec": 0, "endSec": 450},
            {"id": "c3-2", "title": "Blockers & CI/CD Pipeline Fix", "startSec": 450, "endSec": 900}
        ],
        "summaries": {
            "general": "15-minute engineering standup. David completed the local storage highlight persistence module. Marcus debugged database query indices. James resolved GitHub Actions runner timeouts.",
            "sales": "No direct sales topics discussed.",
            "oneOnOne": "Marcus aligned with David on local storage fallback testing.",
            "standup": "Blockers: CI/CD runner timeouts fixed by upgrading runner specs. Goal for today: complete Next.js 15 App Router page layout.",
            "actionItems": [
                "David Kim: Submit PR for localStorage highlight hook.",
                "James Wilson: Monitor staging CI build speeds."
            ]
        },
        "transcript": [
            {"id": "t3-001", "speaker": "Marcus Chen", "startSec": 5, "endSec": 25, "text": "Morning team. Let's do a quick round of updates. David, you want to go first?"},
            {"id": "t3-002", "speaker": "David Kim", "startSec": 28, "endSec": 60, "text": "Sure! Yesterday I finished the custom hook for localStorage highlight caching. Today I'm wiring up the video timestamp sync."},
            {"id": "t3-003", "speaker": "Maya Patel", "startSec": 63, "endSec": 90, "text": "Nice! I tested your branch locally David, and highlights persist perfectly after page refresh."},
            {"id": "t3-004", "speaker": "James Wilson", "startSec": 93, "endSec": 125, "text": "DevOps update: I fixed the flaky CI integration test runners yesterday. Build times dropped from 14 minutes to 4 minutes."}
        ]
    },
    {
        "id": "m-004",
        "title": "1:1 Manager Sync - Q3 Performance & Career Growth",
        "date": "2026-09-22T11:00:00.000Z",
        "durationSec": 1800,
        "meetingType": "1:1",
        "participants": [
            {"id": "p1", "name": "Sarah Jenkins", "email": "sarah.jenkins@fathom.ai", "role": "VP of Product", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
            {"id": "p6", "name": "Rachel Adams", "email": "rachel.adams@fathom.ai", "role": "Product Manager", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"}
        ],
        "chapters": [
            {"id": "c4-1", "title": "Q3 Milestone Review & Wins", "startSec": 0, "endSec": 700},
            {"id": "c4-2", "title": "Q4 Career Growth & Staff PM Track", "startSec": 700, "endSec": 1800}
        ],
        "summaries": {
            "general": "Sarah Jenkins and Rachel Adams held their bi-weekly 1:1 sync. Sarah praised Rachel's product leadership on the smart summary template launch and discussed path toward Staff Product Manager promotion.",
            "sales": "N/A",
            "oneOnOne": "Rachel expressed interest in leading cross-functional AI research initiatives. Sarah agreed to sponsor her entry into executive strategy reviews.",
            "standup": "N/A",
            "actionItems": [
                "Sarah Jenkins: Draft Staff PM promotion rubric document.",
                "Rachel Adams: Outline Q4 AI research roadmap document."
            ]
        },
        "transcript": [
            {"id": "t4-001", "speaker": "Sarah Jenkins", "startSec": 10, "endSec": 40, "text": "Rachel, I wanted to start by saying fantastic job on driving the AI template release last month. The feedback has been stellar."},
            {"id": "t4-002", "speaker": "Rachel Adams", "startSec": 43, "endSec": 80, "text": "Thank you Sarah! It was a great team effort. I'm really keen to push further into automated action item extraction in Q4."},
            {"id": "t4-003", "speaker": "Sarah Jenkins", "startSec": 83, "endSec": 120, "text": "Let's talk about your career trajectory. You've demonstrated senior ownership, and I want to prepare your promotion case for Staff PM."}
        ]
    },
    {
        "id": "m-005",
        "title": "Executive Product Roadmap & Q4 Budget Alignment",
        "date": "2026-09-21T15:00:00.000Z",
        "durationSec": 2700,
        "meetingType": "Executive",
        "participants": [
            {"id": "p1", "name": "Sarah Jenkins", "email": "sarah.jenkins@fathom.ai", "role": "VP of Product", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
            {"id": "p2", "name": "Alex Rivera", "email": "alex.rivera@fathom.ai", "role": "Lead Architect", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
            {"id": "p-ex1", "name": "Carlos Gomez", "email": "carlos.gomez@fathom.ai", "role": "Chief Executive Officer", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"},
            {"id": "p-ex2", "name": "Emily Watson", "email": "emily.watson@fathom.ai", "role": "Chief Financial Officer", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"},
            {"id": "p4", "name": "Elena Rostova", "email": "elena.rostova@fathom.ai", "role": "Design Director", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"},
            {"id": "p6", "name": "Rachel Adams", "email": "rachel.adams@fathom.ai", "role": "Product Manager", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"}
        ],
        "chapters": [
            {"id": "c5-1", "title": "CEO Strategy Vision & Q4 OKRs", "startSec": 0, "endSec": 900},
            {"id": "c5-2", "title": "CFO Financial Projections & R&D Headcount", "startSec": 900, "endSec": 1800},
            {"id": "c5-3", "title": "Product Architecture Sign-Off", "startSec": 1800, "endSec": 2700}
        ],
        "summaries": {
            "general": "Executive leadership approved the Q4 product roadmap and allocated budget for 3 new senior backend engineering hires. Carlos Gomez highlighted market expansion into European enterprise sectors.",
            "sales": "Target ARR expansion to $12M ARR by end of Q4, driven by European data center compliance.",
            "oneOnOne": "Carlos and Sarah agreed on key hiring priorities for engineering management.",
            "standup": "N/A",
            "actionItems": [
                "Emily Watson: Finalize Q4 headcount budget allocation.",
                "Carlos Gomez: Approve EU cloud region hosting expansion."
            ]
        },
        "transcript": [
            {"id": "t5-001", "speaker": "Carlos Gomez", "startSec": 15, "endSec": 50, "text": "Welcome team. Today we need to align on our Q4 financial plan and approve the engineering roadmap for European expansion."},
            {"id": "t5-002", "speaker": "Emily Watson", "startSec": 53, "endSec": 95, "text": "Financially, Q3 revenue exceeded projections by 14%. We have headroom to hire 3 senior backend engineers to support Alex's infrastructure plan."}
        ]
    },
    {
        "id": "m-006",
        "title": "Customer Discovery - Stripe API Integration Feedback",
        "date": "2026-09-20T13:30:00.000Z",
        "durationSec": 1800,
        "meetingType": "Product",
        "participants": [
            {"id": "p6", "name": "Rachel Adams", "email": "rachel.adams@fathom.ai", "role": "Product Manager", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"},
            {"id": "p-cd1", "name": "Liam Vance", "email": "liam@fintechlabs.io", "role": "Head of Engineering", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
            {"id": "p-cd2", "name": "Chloe Bennett", "email": "chloe@fintechlabs.io", "role": "Product Designer", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
        ],
        "chapters": [
            {"id": "c6-1", "title": "Integration Pain Points", "startSec": 0, "endSec": 900},
            {"id": "c6-2", "title": "Webhook & Event Payload Requests", "startSec": 900, "endSec": 1800}
        ],
        "summaries": {
            "general": "Rachel conducted a discovery interview with FintechLabs regarding their custom Fathom integration via webhooks. Liam requested real-time transcript event stream endpoints.",
            "sales": "FintechLabs looking to double API seat license once event webhooks ship.",
            "oneOnOne": "N/A",
            "standup": "N/A",
            "actionItems": [
                "Rachel Adams: Share API webhook documentation draft with Liam."
            ]
        },
        "transcript": [
            {"id": "t6-001", "speaker": "Rachel Adams", "startSec": 10, "endSec": 35, "text": "Thanks Liam and Chloe for taking the time to share feedback on our API integration."},
            {"id": "t6-002", "speaker": "Liam Vance", "startSec": 38, "endSec": 75, "text": "We love the AI summaries, but we really need webhook triggers whenever a meeting highlight is saved."}
        ]
    },
    {
        "id": "m-007",
        "title": "Design System v2.0 UI/UX Review & Component Spec",
        "date": "2026-09-19T10:00:00.000Z",
        "durationSec": 1800,
        "meetingType": "Product",
        "participants": [
            {"id": "p4", "name": "Elena Rostova", "email": "elena.rostova@fathom.ai", "role": "Design Director", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"},
            {"id": "p5", "name": "David Kim", "email": "david.kim@fathom.ai", "role": "Senior Frontend Dev", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"},
            {"id": "p-ds1", "name": "Oliver Vance", "email": "oliver.vance@fathom.ai", "role": "UI Engineer", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
            {"id": "p-ds2", "name": "Sophia Martinez", "email": "sophia.m@fathom.ai", "role": "UX Researcher", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
        ],
        "chapters": [
            {"id": "c7-1", "title": "Design Tokens & Dark Mode Palette", "startSec": 0, "endSec": 900},
            {"id": "c7-2", "title": "Transcript Player Glassmorphism & Micro-animations", "startSec": 900, "endSec": 1800}
        ],
        "summaries": {
            "general": "Elena presented Design System v2.0 featuring sleek glassmorphic card components, tailored indigo color tokens, and responsive transcript sidebars.",
            "sales": "N/A",
            "oneOnOne": "Elena and David reviewed Tailwind CSS v4 variable mappings.",
            "standup": "N/A",
            "actionItems": [
                "David Kim: Create Tailwind utility classes for dark glassmorphism effects."
            ]
        },
        "transcript": [
            {"id": "t7-001", "speaker": "Elena Rostova", "startSec": 10, "endSec": 40, "text": "Today we're reviewing Design System v2.0. We've introduced rich dark mode color tokens to elevate the player visual experience."},
            {"id": "t7-002", "speaker": "David Kim", "startSec": 43, "endSec": 80, "text": "These glassmorphism cards look incredible Elena. The contrast ratios pass AAA accessibility standards perfectly."}
        ]
    },
    {
        "id": "m-008",
        "title": "Sales Pitch - Global Logistics Deal Closing",
        "date": "2026-09-18T16:00:00.000Z",
        "durationSec": 2400,
        "meetingType": "Sales",
        "participants": [
            {"id": "p-s1", "name": "Jessica Vance", "email": "jessica.vance@fathom.ai", "role": "Account Executive", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"},
            {"id": "p-gl1", "name": "Robert Sterling", "email": "r.sterling@globallogistics.com", "role": "VP of Operations", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
            {"id": "p-gl2", "name": "Amanda Croft", "email": "a.croft@globallogistics.com", "role": "Director of Technology", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"},
            {"id": "p-s4", "name": "Tom Brady", "email": "tom.brady@fathom.ai", "role": "Solutions Engineer", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
        ],
        "chapters": [
            {"id": "c8-1", "title": "Fathom Notetaker Live Demo", "startSec": 0, "endSec": 1200},
            {"id": "c8-2", "title": "Contract Terms & Implementation Schedule", "startSec": 1200, "endSec": 2400}
        ],
        "summaries": {
            "general": "Jessica Vance demoed Fathom's automated action item sync to Global Logistics execs. Robert Sterling agreed to initiate pilot deployment for 200 account managers.",
            "sales": "Closed Deal: 200 seats initial pilot ($84k ARR). Contract signed verbally, execution target Friday.",
            "oneOnOne": "N/A",
            "standup": "N/A",
            "actionItems": [
                "Jessica Vance: Send Master Services Agreement to Amanda Croft."
            ]
        },
        "transcript": [
            {"id": "t8-001", "speaker": "Jessica Vance", "startSec": 15, "endSec": 45, "text": "Robert and Amanda, let me show you how Fathom automatically syncs meeting summaries into Salesforce in real time."},
            {"id": "t8-002", "speaker": "Robert Sterling", "startSec": 48, "endSec": 85, "text": "If this cuts down manual meeting logging for our logistics managers, we're ready to sign today."}
        ]
    },
    {
        "id": "m-009",
        "title": "1:1 Career Mentorship - Staff Engineering Track",
        "date": "2026-09-17T14:00:00.000Z",
        "durationSec": 1500,
        "meetingType": "1:1",
        "participants": [
            {"id": "p2", "name": "Alex Rivera", "email": "alex.rivera@fathom.ai", "role": "Lead Architect", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
            {"id": "p5", "name": "David Kim", "email": "david.kim@fathom.ai", "role": "Senior Frontend Dev", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"}
        ],
        "chapters": [
            {"id": "c9-1", "title": "Technical Leadership & System Design Growth", "startSec": 0, "endSec": 1500}
        ],
        "summaries": {
            "general": "Alex Rivera mentored David Kim on technical design document framing and leading architecture working groups.",
            "sales": "N/A",
            "oneOnOne": "David requested mentorship on distributed consensus algorithms and streaming performance optimization.",
            "standup": "N/A",
            "actionItems": [
                "David Kim: Draft technical design document for client-side state streaming."
            ]
        },
        "transcript": [
            {"id": "t9-001", "speaker": "Alex Rivera", "startSec": 10, "endSec": 35, "text": "David, system architecture leadership is about guiding trade-off decisions clearly for the broader team."},
            {"id": "t9-002", "speaker": "David Kim", "startSec": 38, "endSec": 70, "text": "That makes total sense Alex. Writing the RFC for local highlights was a great first step."}
        ]
    },
    {
        "id": "m-010",
        "title": "Post-Mortem Review - API Latency Spike Incident #408",
        "date": "2026-09-16T11:00:00.000Z",
        "durationSec": 2100,
        "meetingType": "Engineering",
        "participants": [
            {"id": "p2", "name": "Alex Rivera", "email": "alex.rivera@fathom.ai", "role": "Lead Architect", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
            {"id": "p3", "name": "Marcus Chen", "email": "marcus.chen@fathom.ai", "role": "Tech Lead", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
            {"id": "p7", "name": "James Wilson", "email": "james.wilson@fathom.ai", "role": "DevOps Lead", "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"},
            {"id": "p8", "name": "Maya Patel", "email": "maya.patel@fathom.ai", "role": "QA Lead", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"},
            {"id": "p5", "name": "David Kim", "email": "david.kim@fathom.ai", "role": "Senior Frontend Dev", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"}
        ],
        "chapters": [
            {"id": "ca-1", "title": "Timeline of Incident #408", "startSec": 0, "endSec": 700},
            {"id": "ca-2", "title": "Root Cause Analysis: Redis Connection Pool Exhaustion", "startSec": 700, "endSec": 1400},
            {"id": "ca-3", "title": "Remediation & Preventative Infrastructure Fixes", "startSec": 1400, "endSec": 2100}
        ],
        "summaries": {
            "general": "Blameless post-mortem review of Incident #408. Root cause was Redis connection pool exhaustion during a 300% traffic surge. Implemented connection pooling and circuit breaker protection.",
            "sales": "N/A",
            "oneOnOne": "N/A",
            "standup": "N/A",
            "actionItems": [
                "James Wilson: Upgrade Redis cluster instance size and tune maxconnections setting.",
                "Marcus Chen: Implement resilience4j circuit breaker around audio worker calls."
            ]
        },
        "transcript": [
            {"id": "ta-001", "speaker": "James Wilson", "startSec": 10, "endSec": 45, "text": "Let me begin the blameless post-mortem for Incident #408. Latency spiked to 4.2s at 14:15 UTC yesterday."},
            {"id": "ta-002", "speaker": "Marcus Chen", "startSec": 48, "endSec": 85, "text": "The root cause was Redis connection pool exhaustion when 50 worker pods simultaneously reconnected after a network blip."}
        ]
    }
]

os.makedirs("src/data", exist_ok=True)
with open("src/data/seed-meetings.json", "w", encoding="utf-8") as f:
    json.dump(meetings, f, indent=2)

print(f"Successfully wrote src/data/seed-meetings.json with {len(meetings)} meetings!")
