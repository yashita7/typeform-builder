"""
Seed script that creates sample data on startup.
Creates 2 published forms with mixed question types and sample responses.
"""
import secrets
from datetime import datetime, timedelta
from app.db import SessionLocal
from app.models import Form, Question, QuestionOption, Response, Answer


def generate_slug():
    """Generate a URL-safe random slug for published forms."""
    return secrets.token_urlsafe(8)


def seed_database():
    """
    Create sample forms and responses if database is empty.
    Only runs once on first startup.
    """
    db = SessionLocal()
    
    try:
        # Check if we already have data (avoid re-seeding)
        existing_forms = db.query(Form).count()
        if existing_forms > 0:
            print("Database already seeded, skipping...")
            return
        
        print("Seeding database with sample data...")
        
        # ====================================================================
        # Form 1: Customer Feedback Survey
        # ====================================================================
        form1 = Form(
            title="Customer Feedback Survey",
            description="Help us improve our service by sharing your thoughts",
            status="published",
            share_slug=generate_slug(),
            created_at=datetime.utcnow() - timedelta(days=7),
            updated_at=datetime.utcnow() - timedelta(days=7)
        )
        db.add(form1)
        db.flush()  # Get form1.id
        
        # Question 1: Email (required)
        q1_form1 = Question(
            form_id=form1.id,
            type="email",
            title="What's your email address?",
            description="We'll use this to follow up on your feedback",
            required=True,
            order_index=0
        )
        db.add(q1_form1)
        
        # Question 2: Rating (required)
        q2_form1 = Question(
            form_id=form1.id,
            type="rating",
            title="How would you rate your overall experience?",
            description="1 = Poor, 5 = Excellent",
            required=True,
            order_index=1,
            settings_json={"max": 5}
        )
        db.add(q2_form1)
        
        # Question 3: Multiple choice
        q3_form1 = Question(
            form_id=form1.id,
            type="multiple_choice",
            title="How did you hear about us?",
            required=True,
            order_index=2
        )
        db.add(q3_form1)
        db.flush()  # Get q3_form1.id for options
        
        # Add options for multiple choice question
        for idx, label in enumerate(["Social Media", "Friend Referral", "Search Engine", "Advertisement", "Other"]):
            option = QuestionOption(
                question_id=q3_form1.id,
                label=label,
                order_index=idx
            )
            db.add(option)
        
        # Question 4: Long text (optional)
        q4_form1 = Question(
            form_id=form1.id,
            type="long_text",
            title="Do you have any additional comments or suggestions?",
            description="Feel free to share anything that would help us improve",
            required=False,
            order_index=3
        )
        db.add(q4_form1)
        
        # Question 5: Yes/No
        q5_form1 = Question(
            form_id=form1.id,
            type="yes_no",
            title="Would you recommend us to a friend?",
            required=True,
            order_index=4
        )
        db.add(q5_form1)
        
        db.flush()  # Ensure all questions have IDs
        
        # Create 3 sample responses for Form 1
        responses_data_form1 = [
            {
                "submitted_at": datetime.utcnow() - timedelta(days=5),
                "answers": [
                    {"question": q1_form1, "value": "alice@example.com"},
                    {"question": q2_form1, "value": "5"},
                    {"question": q3_form1, "value": "Friend Referral"},
                    {"question": q4_form1, "value": "Great service! Very satisfied with everything."},
                    {"question": q5_form1, "value": "Yes"}
                ]
            },
            {
                "submitted_at": datetime.utcnow() - timedelta(days=3),
                "answers": [
                    {"question": q1_form1, "value": "bob@example.com"},
                    {"question": q2_form1, "value": "4"},
                    {"question": q3_form1, "value": "Search Engine"},
                    {"question": q4_form1, "value": ""},
                    {"question": q5_form1, "value": "Yes"}
                ]
            },
            {
                "submitted_at": datetime.utcnow() - timedelta(days=1),
                "answers": [
                    {"question": q1_form1, "value": "charlie@example.com"},
                    {"question": q2_form1, "value": "3"},
                    {"question": q3_form1, "value": "Social Media"},
                    {"question": q4_form1, "value": "The service was okay, but response time could be faster."},
                    {"question": q5_form1, "value": "No"}
                ]
            }
        ]
        
        for resp_data in responses_data_form1:
            response = Response(
                form_id=form1.id,
                submitted_at=resp_data["submitted_at"],
                completed=True
            )
            db.add(response)
            db.flush()  # Get response.id
            
            for answer_data in resp_data["answers"]:
                answer = Answer(
                    response_id=response.id,
                    question_id=answer_data["question"].id,
                    value_text=answer_data["value"]
                )
                db.add(answer)
        
        # ====================================================================
        # Form 2: Event Registration
        # ====================================================================
        form2 = Form(
            title="Tech Conference 2024 Registration",
            description="Register for our annual tech conference",
            status="published",
            share_slug=generate_slug(),
            created_at=datetime.utcnow() - timedelta(days=14),
            updated_at=datetime.utcnow() - timedelta(days=14)
        )
        db.add(form2)
        db.flush()  # Get form2.id
        
        # Question 1: Short text (name)
        q1_form2 = Question(
            form_id=form2.id,
            type="short_text",
            title="What's your full name?",
            required=True,
            order_index=0
        )
        db.add(q1_form2)
        
        # Question 2: Email
        q2_form2 = Question(
            form_id=form2.id,
            type="email",
            title="What's your email address?",
            required=True,
            order_index=1
        )
        db.add(q2_form2)
        
        # Question 3: Dropdown
        q3_form2 = Question(
            form_id=form2.id,
            type="dropdown",
            title="Select your experience level",
            required=True,
            order_index=2
        )
        db.add(q3_form2)
        db.flush()  # Get q3_form2.id for options
        
        for idx, label in enumerate(["Beginner", "Intermediate", "Advanced", "Expert"]):
            option = QuestionOption(
                question_id=q3_form2.id,
                label=label,
                order_index=idx
            )
            db.add(option)
        
        # Question 4: Number
        q4_form2 = Question(
            form_id=form2.id,
            type="number",
            title="How many years of experience do you have?",
            required=True,
            order_index=3,
            settings_json={"min": 0, "max": 50}
        )
        db.add(q4_form2)
        
        # Question 5: Rating
        q5_form2 = Question(
            form_id=form2.id,
            type="rating",
            title="How interested are you in AI/ML topics?",
            description="1 = Not interested, 5 = Very interested",
            required=True,
            order_index=4,
            settings_json={"max": 5}
        )
        db.add(q5_form2)
        
        db.flush()  # Ensure all questions have IDs
        
        # Create 4 sample responses for Form 2
        responses_data_form2 = [
            {
                "submitted_at": datetime.utcnow() - timedelta(days=10),
                "answers": [
                    {"question": q1_form2, "value": "David Smith"},
                    {"question": q2_form2, "value": "david@tech.com"},
                    {"question": q3_form2, "value": "Advanced"},
                    {"question": q4_form2, "value": "8"},
                    {"question": q5_form2, "value": "5"}
                ]
            },
            {
                "submitted_at": datetime.utcnow() - timedelta(days=8),
                "answers": [
                    {"question": q1_form2, "value": "Emma Wilson"},
                    {"question": q2_form2, "value": "emma.w@startup.io"},
                    {"question": q3_form2, "value": "Intermediate"},
                    {"question": q4_form2, "value": "3"},
                    {"question": q5_form2, "value": "4"}
                ]
            },
            {
                "submitted_at": datetime.utcnow() - timedelta(days=6),
                "answers": [
                    {"question": q1_form2, "value": "Frank Chen"},
                    {"question": q2_form2, "value": "frank.chen@email.com"},
                    {"question": q3_form2, "value": "Expert"},
                    {"question": q4_form2, "value": "15"},
                    {"question": q5_form2, "value": "5"}
                ]
            },
            {
                "submitted_at": datetime.utcnow() - timedelta(days=2),
                "answers": [
                    {"question": q1_form2, "value": "Grace Taylor"},
                    {"question": q2_form2, "value": "grace.t@company.com"},
                    {"question": q3_form2, "value": "Beginner"},
                    {"question": q4_form2, "value": "1"},
                    {"question": q5_form2, "value": "3"}
                ]
            }
        ]
        
        for resp_data in responses_data_form2:
            response = Response(
                form_id=form2.id,
                submitted_at=resp_data["submitted_at"],
                completed=True
            )
            db.add(response)
            db.flush()  # Get response.id
            
            for answer_data in resp_data["answers"]:
                answer = Answer(
                    response_id=response.id,
                    question_id=answer_data["question"].id,
                    value_text=answer_data["value"]
                )
                db.add(answer)
        
        # Commit all changes
        db.commit()
        print("✓ Database seeded successfully!")
        print(f"  - Created 2 published forms")
        print(f"  - Form 1: '{form1.title}' with {len(responses_data_form1)} responses")
        print(f"  - Form 2: '{form2.title}' with {len(responses_data_form2)} responses")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
