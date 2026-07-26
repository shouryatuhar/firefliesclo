"""
Seed script: populate database with 4 realistic fake meetings.
Run with: python -m app.seed
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, init_db
from app.models import Base, User, Meeting, Speaker, TranscriptSegment, Summary, ActionItem, KeyTopic


def seed_database():
    """
    Initialize database and populate with sample data.
    """
    # Create all tables
    init_db()
    
    db = SessionLocal()
    
    # Create default user (appears in navbar)
    existing_user = db.query(User).filter(User.email == "user@example.com").first()
    if not existing_user:
        default_user = User(
            name="Alex Johnson",
            email="user@example.com",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        )
        db.add(default_user)
        db.commit()
    
    # =========================================================================
    # MEETING 1: Product Demo - New Dashboard Features
    # =========================================================================
    
    meeting1 = Meeting(
        title="Q3 Product Demo - New Dashboard Features",
        description="Showcase new analytics dashboard and real-time metrics tracking for Q3 release.",
        date_recorded=datetime.utcnow() - timedelta(days=3),
        thumbnail_url="https://via.placeholder.com/160x90?text=Product+Demo",
    )
    db.add(meeting1)
    db.flush()
    
    # Speakers for meeting 1
    speaker1_m1 = Speaker(meeting_id=meeting1.id, name="Sarah Chen", email="sarah@company.com")
    speaker2_m1 = Speaker(meeting_id=meeting1.id, name="Mike Rodriguez", email="mike@company.com")
    speaker3_m1 = Speaker(meeting_id=meeting1.id, name="Lisa Park", email="lisa@company.com")
    db.add_all([speaker1_m1, speaker2_m1, speaker3_m1])
    db.flush()
    
    # Transcript segments for meeting 1
    segments_m1 = [
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker1_m1.id, text="Good morning everyone. Today we're excited to showcase the new dashboard features we've been building for Q3.", start_time_seconds=0.0, end_time_seconds=8.5, sequence_order=1),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker1_m1.id, text="The main focus has been on real-time metrics and improved data visualization.", start_time_seconds=8.5, end_time_seconds=15.2, sequence_order=2),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker2_m1.id, text="We've also added custom widget support, which I think will be a game changer for our users.", start_time_seconds=15.2, end_time_seconds=23.0, sequence_order=3),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker1_m1.id, text="Exactly. Let me walk through the UI changes. As you can see on screen, we've reorganized the left sidebar for better navigation.", start_time_seconds=23.0, end_time_seconds=33.5, sequence_order=4),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker3_m1.id, text="How does this compare to what Tableau offers?", start_time_seconds=33.5, end_time_seconds=37.0, sequence_order=5),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker2_m1.id, text="Good question. Our solution is more lightweight and integrates directly with our platform, so no additional setup required.", start_time_seconds=37.0, end_time_seconds=48.0, sequence_order=6),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker1_m1.id, text="The real-time updates are powered by our new event streaming pipeline. Dashboards refresh within 5 seconds of data changes.", start_time_seconds=48.0, end_time_seconds=58.5, sequence_order=7),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker3_m1.id, text="What's the performance impact on the frontend?", start_time_seconds=58.5, end_time_seconds=62.0, sequence_order=8),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker2_m1.id, text="Minimal. We've optimized with virtual scrolling and lazy loading. Initial load is under 2 seconds even with large datasets.", start_time_seconds=62.0, end_time_seconds=73.5, sequence_order=9),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker1_m1.id, text="We're planning a phased rollout. Beta for select customers starting next week, general availability in 4 weeks.", start_time_seconds=73.5, end_time_seconds=85.0, sequence_order=10),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker3_m1.id, text="Should we prepare marketing materials now or wait for beta feedback?", start_time_seconds=85.0, end_time_seconds=91.5, sequence_order=11),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker1_m1.id, text="Let's prepare a draft now and refine based on beta feedback. We need to be ready for launch day.", start_time_seconds=91.5, end_time_seconds=102.0, sequence_order=12),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker2_m1.id, text="One more thing: the custom widget API is now public. Third-party developers can build extensions.", start_time_seconds=102.0, end_time_seconds=112.5, sequence_order=13),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker3_m1.id, text="That's huge! Have we documented the API yet?", start_time_seconds=112.5, end_time_seconds=117.0, sequence_order=14),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker2_m1.id, text="Yes, it's in the developer portal. We also included 5 sample widgets to get developers started.", start_time_seconds=117.0, end_time_seconds=127.0, sequence_order=15),
        TranscriptSegment(meeting_id=meeting1.id, speaker_id=speaker1_m1.id, text="Let's plan a developer webinar for next month to showcase the API and the sample widgets.", start_time_seconds=127.0, end_time_seconds=137.5, sequence_order=16),
    ]
    db.add_all(segments_m1)
    db.flush()
    
    # Summary for meeting 1
    summary1 = Summary(
        meeting_id=meeting1.id,
        overview="Team demoed Q3 product release featuring new analytics dashboard with real-time metrics, custom widgets, and public developer API. Phased rollout planned: beta next week, GA in 4 weeks. Key highlights: sub-5-second real-time updates, optimized performance, and sample widget extensions available. Team will prepare marketing materials and developer webinar for launch support."
    )
    db.add(summary1)
    db.flush()
    
    # Action items for meeting 1
    action_items_m1 = [
        ActionItem(meeting_id=meeting1.id, assigned_to="Sarah Chen", description="Finalize beta user list and send invitations", completed=False),
        ActionItem(meeting_id=meeting1.id, assigned_to="Mike Rodriguez", description="Publish developer documentation and sample widgets to portal", completed=False),
        ActionItem(meeting_id=meeting1.id, assigned_to="Lisa Park", description="Draft marketing materials highlighting key features and real-time updates", completed=False),
        ActionItem(meeting_id=meeting1.id, assigned_to="Sarah Chen", description="Schedule developer webinar for early August", completed=False),
    ]
    db.add_all(action_items_m1)
    db.flush()
    
    # Key topics for meeting 1
    key_topics_m1 = [
        KeyTopic(meeting_id=meeting1.id, title="Real-Time Metrics Dashboard", description="New dashboard with 5-second refresh rate and optimized frontend performance", timestamp_seconds=23.0, sequence_order=1),
        KeyTopic(meeting_id=meeting1.id, title="Custom Widget Support", description="Public API for third-party developers with 5 sample widgets", timestamp_seconds=15.2, sequence_order=2),
        KeyTopic(meeting_id=meeting1.id, title="Phased Rollout Strategy", description="Beta next week for select customers, GA in 4 weeks", timestamp_seconds=73.5, sequence_order=3),
    ]
    db.add_all(key_topics_m1)
    
    # =========================================================================
    # MEETING 2: Engineering Standup
    # =========================================================================
    
    meeting2 = Meeting(
        title="Engineering Team Standup - Sprint 47",
        description="Weekly standup covering sprint progress, blockers, and upcoming deliverables.",
        date_recorded=datetime.utcnow() - timedelta(days=1),
        thumbnail_url="https://via.placeholder.com/160x90?text=Standup",
    )
    db.add(meeting2)
    db.flush()
    
    speaker1_m2 = Speaker(meeting_id=meeting2.id, name="James Wilson", email="james@company.com")
    speaker2_m2 = Speaker(meeting_id=meeting2.id, name="Emma Thompson", email="emma@company.com")
    speaker3_m2 = Speaker(meeting_id=meeting2.id, name="David Kim", email="david@company.com")
    speaker4_m2 = Speaker(meeting_id=meeting2.id, name="Rachel Green", email="rachel@company.com")
    db.add_all([speaker1_m2, speaker2_m2, speaker3_m2, speaker4_m2])
    db.flush()
    
    segments_m2 = [
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker1_m2.id, text="Good morning team. Let's kick off our sprint 47 standup. James here, I finished the API authentication refactor yesterday.", start_time_seconds=0.0, end_time_seconds=10.0, sequence_order=1),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker1_m2.id, text="Tests are passing, but we need to update the integration tests before merging. I'll have a PR up by noon.", start_time_seconds=10.0, end_time_seconds=20.5, sequence_order=2),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker2_m2.id, text="Emma here. I'm working on the database migration scripts. We're moving user profiles to the new schema.", start_time_seconds=20.5, end_time_seconds=30.0, sequence_order=3),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker2_m2.id, text="I've hit a blocker: the old schema has orphaned records that we need to clean up first. I'm working with data team on that.", start_time_seconds=30.0, end_time_seconds=42.5, sequence_order=4),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker3_m2.id, text="David here. Frontend UI for the new dashboard is 80% done. I'm currently implementing the real-time update logic.", start_time_seconds=42.5, end_time_seconds=53.0, sequence_order=5),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker3_m2.id, text="No blockers so far, but I need design approval on the color scheme for the dark mode variant.", start_time_seconds=53.0, end_time_seconds=63.0, sequence_order=6),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker4_m2.id, text="Rachel here. I've been on infra work. The new Kubernetes cluster is provisioned and running tests.", start_time_seconds=63.0, end_time_seconds=73.0, sequence_order=7),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker4_m2.id, text="We found some latency issues with the database connections under load. Investigating with ops team.", start_time_seconds=73.0, end_time_seconds=85.5, sequence_order=8),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker1_m2.id, text="Good. Let's sync with ops after this. Emma, when can you have the cleanup done?", start_time_seconds=85.5, end_time_seconds=95.0, sequence_order=9),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker2_m2.id, text="Hoping by end of day tomorrow. Should only affect about 15k records.", start_time_seconds=95.0, end_time_seconds=103.5, sequence_order=10),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker1_m2.id, text="And David, let's get design feedback on dark mode by EOD. It's on the critical path.", start_time_seconds=103.5, end_time_seconds=113.0, sequence_order=11),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker3_m2.id, text="Will follow up with them right after this. Should have their feedback by 2 PM.", start_time_seconds=113.0, end_time_seconds=122.0, sequence_order=12),
        TranscriptSegment(meeting_id=meeting2.id, speaker_id=speaker1_m2.id, text="Perfect. One more thing: we're on track for sprint closeout Friday. Sprint 48 planning is Thursday at 2 PM. See you all then.", start_time_seconds=122.0, end_time_seconds=135.0, sequence_order=13),
    ]
    db.add_all(segments_m2)
    db.flush()
    
    summary2 = Summary(
        meeting_id=meeting2.id,
        overview="Sprint 47 standup: API auth refactor complete, awaiting integration tests; database migration in progress with data cleanup blocker; dashboard UI 80% done, needs design approval on dark mode; infrastructure cluster provisioned with latency issues under investigation. All items on track for sprint close Friday."
    )
    db.add(summary2)
    db.flush()
    
    action_items_m2 = [
        ActionItem(meeting_id=meeting2.id, assigned_to="James Wilson", description="Submit API authentication PR with updated integration tests by noon", completed=False),
        ActionItem(meeting_id=meeting2.id, assigned_to="Emma Thompson", description="Complete database schema cleanup with data team by EOD tomorrow", completed=False),
        ActionItem(meeting_id=meeting2.id, assigned_to="David Kim", description="Get design feedback on dark mode color scheme by 2 PM", completed=False),
        ActionItem(meeting_id=meeting2.id, assigned_to="Rachel Green", description="Investigate and resolve Kubernetes cluster database connection latency", completed=False),
    ]
    db.add_all(action_items_m2)
    db.flush()
    
    key_topics_m2 = [
        KeyTopic(meeting_id=meeting2.id, title="API Authentication Refactor", description="Completed with integration test updates required", timestamp_seconds=0.0, sequence_order=1),
        KeyTopic(meeting_id=meeting2.id, title="Database Migration Blocker", description="Orphaned records need cleanup before schema migration", timestamp_seconds=30.0, sequence_order=2),
        KeyTopic(meeting_id=meeting2.id, title="Dashboard UI Development", description="80% complete, dark mode variant pending design approval", timestamp_seconds=42.5, sequence_order=3),
        KeyTopic(meeting_id=meeting2.id, title="Infrastructure & Deployment", description="Kubernetes cluster ready but with latency issues under investigation", timestamp_seconds=63.0, sequence_order=4),
    ]
    db.add_all(key_topics_m2)
    
    # =========================================================================
    # MEETING 3: Client Feedback Session
    # =========================================================================
    
    meeting3 = Meeting(
        title="Client Feedback - Acme Corp Q3 Roadmap",
        description="Customer feedback session with Acme Corp on product roadmap and feature requests.",
        date_recorded=datetime.utcnow() - timedelta(days=5),
        thumbnail_url="https://via.placeholder.com/160x90?text=Client+Feedback",
    )
    db.add(meeting3)
    db.flush()
    
    speaker1_m3 = Speaker(meeting_id=meeting3.id, name="Tom Allen", email="tom.allen@company.com")
    speaker2_m3 = Speaker(meeting_id=meeting3.id, name="Lisa Martinez", email="lisa.martinez@acmecorp.com")
    speaker3_m3 = Speaker(meeting_id=meeting3.id, name="Marcus Johnson", email="marcus@acmecorp.com")
    db.add_all([speaker1_m3, speaker2_m3, speaker3_m3])
    db.flush()
    
    segments_m3 = [
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker1_m3.id, text="Hi Lisa and Marcus, thanks for joining today. We're excited to hear your feedback on our Q3 roadmap.", start_time_seconds=0.0, end_time_seconds=10.5, sequence_order=1),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker2_m3.id, text="Thanks for having us. Overall, we're very happy with the product. The dashboard has improved our reporting significantly.", start_time_seconds=10.5, end_time_seconds=22.0, sequence_order=2),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker3_m3.id, text="That said, our team has been asking for better export capabilities. We need to export reports to PDF with our branding.", start_time_seconds=22.0, end_time_seconds=34.5, sequence_order=3),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker1_m3.id, text="Good feedback. PDF export is actually on our Q4 roadmap. We're also planning white-label options.", start_time_seconds=34.5, end_time_seconds=46.0, sequence_order=4),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker2_m3.id, text="That's great to hear. One more thing: our analysts would love to see more advanced filtering options in the dashboard.", start_time_seconds=46.0, end_time_seconds=58.5, sequence_order=5),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker2_m3.id, text="Specifically, we'd like to filter by custom date ranges and save those as presets.", start_time_seconds=58.5, end_time_seconds=68.0, sequence_order=6),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker1_m3.id, text="Custom date ranges and preset filters are definitely doable. Let me take that down as an enhancement request.", start_time_seconds=68.0, end_time_seconds=79.5, sequence_order=7),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker3_m3.id, text="Also, we've been experiencing occasional slowness during peak hours. Can you look into performance optimization?", start_time_seconds=79.5, end_time_seconds=92.0, sequence_order=8),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker1_m3.id, text="We've already identified some optimization opportunities. We'll have a fix deployed by end of August.", start_time_seconds=92.0, end_time_seconds=103.5, sequence_order=9),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker2_m3.id, text="Excellent. And are there any plans for mobile app support? Our team is often on the go.", start_time_seconds=103.5, end_time_seconds=114.0, sequence_order=10),
        TranscriptSegment(meeting_id=meeting3.id, speaker_id=speaker1_m3.id, text="Mobile is definitely in scope. We're evaluating options for native apps versus responsive web. I'll share an update in next month's call.", start_time_seconds=114.0, end_time_seconds=127.5, sequence_order=11),
    ]
    db.add_all(segments_m3)
    db.flush()
    
    summary3 = Summary(
        meeting_id=meeting3.id,
        overview="Positive feedback from Acme Corp on dashboard improvements and reporting. Key requests: PDF export with branding (Q4), advanced filtering with custom date presets, performance optimization by end of August, and mobile app exploration. All items noted for product roadmap prioritization."
    )
    db.add(summary3)
    db.flush()
    
    action_items_m3 = [
        ActionItem(meeting_id=meeting3.id, assigned_to="Tom Allen", description="Add custom date range and preset filter enhancement to Q4 backlog", completed=False),
        ActionItem(meeting_id=meeting3.id, assigned_to="Tom Allen", description="Schedule follow-up with Acme Corp on mobile app roadmap", completed=False),
        ActionItem(meeting_id=meeting3.id, assigned_to="", description="Performance optimization for peak hours to be deployed by end of August", completed=False),
    ]
    db.add_all(action_items_m3)
    db.flush()
    
    key_topics_m3 = [
        KeyTopic(meeting_id=meeting3.id, title="PDF Export & Branding", description="Customer needs PDF export with company branding, planned for Q4", timestamp_seconds=22.0, sequence_order=1),
        KeyTopic(meeting_id=meeting3.id, title="Advanced Filtering", description="Request for custom date ranges and saved filter presets", timestamp_seconds=46.0, sequence_order=2),
        KeyTopic(meeting_id=meeting3.id, title="Performance Optimization", description="Peak hour slowness to be fixed by end of August", timestamp_seconds=79.5, sequence_order=3),
    ]
    db.add_all(key_topics_m3)
    
    # =========================================================================
    # MEETING 4: Q4 Strategy Planning
    # =========================================================================
    
    meeting4 = Meeting(
        title="Q4 Strategic Planning - Company Goals & OKRs",
        description="Executive team planning session for Q4 company goals, OKRs, and resource allocation.",
        date_recorded=datetime.utcnow() - timedelta(days=7),
        thumbnail_url="https://via.placeholder.com/160x90?text=Strategy",
    )
    db.add(meeting4)
    db.flush()
    
    speaker1_m4 = Speaker(meeting_id=meeting4.id, name="CEO - Patricia Brown", email="patricia@company.com")
    speaker2_m4 = Speaker(meeting_id=meeting4.id, name="CFO - Robert Chang", email="robert@company.com")
    speaker3_m4 = Speaker(meeting_id=meeting4.id, name="VP Product - Susan Davis", email="susan@company.com")
    db.add_all([speaker1_m4, speaker2_m4, speaker3_m4])
    db.flush()
    
    segments_m4 = [
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker1_m4.id, text="Good morning leadership team. Let's finalize our Q4 goals. We're already tracking well against Q3 targets.", start_time_seconds=0.0, end_time_seconds=11.5, sequence_order=1),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker3_m4.id, text="On the product side, we want to focus on three key initiatives: platform expansion, customer retention, and developer ecosystem growth.", start_time_seconds=11.5, end_time_seconds=25.5, sequence_order=2),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker2_m4.id, text="From a financial perspective, we have a 10 million dollar budget allocation. We need to prioritize ruthlessly.", start_time_seconds=25.5, end_time_seconds=37.5, sequence_order=3),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker1_m4.id, text="Let's break down the budget by department. Susan, what's your product ask?", start_time_seconds=37.5, end_time_seconds=46.5, sequence_order=4),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker3_m4.id, text="We need 4 million for platform expansion, 2.5 million for customer success, and 1.5 million for developer programs.", start_time_seconds=46.5, end_time_seconds=59.0, sequence_order=5),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker2_m4.id, text="That's 8 million right there. We have room for marketing and ops initiatives with the remaining 2 million.", start_time_seconds=59.0, end_time_seconds=71.0, sequence_order=6),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker1_m4.id, text="Good. I want to see aggressive growth targets. What's our revenue projection for Q4?", start_time_seconds=71.0, end_time_seconds=81.5, sequence_order=7),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker2_m4.id, text="Based on current pipeline and conversion rates, we're looking at 2.8 million in Q4 if we execute well.", start_time_seconds=81.5, end_time_seconds=93.5, sequence_order=8),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker1_m4.id, text="Let's target 3.2 million. That means we need to improve our conversion rate by 12 percent.", start_time_seconds=93.5, end_time_seconds=105.0, sequence_order=9),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker3_m4.id, text="That's ambitious but doable with the new onboarding flow and customer success initiatives.", start_time_seconds=105.0, end_time_seconds=116.5, sequence_order=10),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker1_m4.id, text="Alright. Let's each own one OKR. Susan owns platform expansion, Robert owns revenue growth, I'll own partnerships.", start_time_seconds=116.5, end_time_seconds=130.0, sequence_order=11),
        TranscriptSegment(meeting_id=meeting4.id, speaker_id=speaker1_m4.id, text="We'll check in weekly. Let's execute hard and finish strong before the holidays.", start_time_seconds=130.0, end_time_seconds=140.0, sequence_order=12),
    ]
    db.add_all(segments_m4)
    db.flush()
    
    summary4 = Summary(
        meeting_id=meeting4.id,
        overview="Q4 strategic planning: Three product initiatives (platform expansion, customer retention, developer ecosystem). 10 million dollar budget allocated: 4M platform, 2.5M customer success, 1.5M developer programs, 2M marketing/ops. Revenue target: 3.2M (vs 2.8M projection). OKRs assigned by owner with weekly check-ins."
    )
    db.add(summary4)
    db.flush()
    
    action_items_m4 = [
        ActionItem(meeting_id=meeting4.id, assigned_to="Susan Davis", description="Finalize Q4 platform expansion OKRs and engineering resource plan", completed=False),
        ActionItem(meeting_id=meeting4.id, assigned_to="Robert Chang", description="Break down revenue targets by sales team and set weekly tracking", completed=False),
        ActionItem(meeting_id=meeting4.id, assigned_to="Patricia Brown", description="Identify and initiate partnership discussions by mid-September", completed=False),
        ActionItem(meeting_id=meeting4.id, assigned_to="", description="Schedule weekly Q4 OKR check-in meetings starting next Monday", completed=False),
        ActionItem(meeting_id=meeting4.id, assigned_to="", description="Communicate Q4 goals and budget allocations to all department heads", completed=False),
    ]
    db.add_all(action_items_m4)
    db.flush()
    
    key_topics_m4 = [
        KeyTopic(meeting_id=meeting4.id, title="Q4 Product Initiatives", description="Platform expansion, customer retention, developer ecosystem growth", timestamp_seconds=11.5, sequence_order=1),
        KeyTopic(meeting_id=meeting4.id, title="Budget Allocation", description="10M total: 4M platform, 2.5M customer success, 1.5M developer, 2M marketing/ops", timestamp_seconds=25.5, sequence_order=2),
        KeyTopic(meeting_id=meeting4.id, title="Revenue Growth Target", description="3.2M target (12% conversion improvement), up from 2.8M projection", timestamp_seconds=71.0, sequence_order=3),
    ]
    db.add_all(key_topics_m4)
    
    # Commit all changes
    db.commit()
    db.close()
    
    print("✅ Database seeded successfully!")
    print("   - 1 default user")
    print("   - 4 meetings with full transcripts, summaries, action items, and key topics")


if __name__ == "__main__":
    seed_database()
