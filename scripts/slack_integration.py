#!/usr/bin/env python3
"""
Slack Integration for Activity Patterns
Formats activity data for Slack notifications
"""

def format_activity_slack_message(activity_data):
    """
    Format activity patterns data for Slack message sections.
    
    Args:
        activity_data: Dictionary containing activity pattern data
        
    Returns:
        String formatted for Slack message
    """
    vc_count = len(activity_data.get('version_control', {}))
    design_count = len(activity_data.get('design_ai_tools', {}))
    identity_count = len(activity_data.get('credentials_identity', {}))
    
    return (
        f":bar_chart: Activity patterns updated — {vc_count} VC hosts, "
        f"{design_count} design tools, "
        f"{identity_count} identity endpoints."
    )


def add_activity_to_slack_sections(slack_sections, activity_data):
    """
    Append activity pattern summary to existing Slack sections list.
    
    Args:
        slack_sections: List of Slack message sections
        activity_data: Dictionary containing activity pattern data
    """
    message = format_activity_slack_message(activity_data)
    slack_sections.append(message)
    return slack_sections


# Example usage
if __name__ == "__main__":
    from collect_activity_patterns import collect_activity_patterns
    
    activity_data = collect_activity_patterns()
    slack_sections = []
    
    # Add to slack message
    slack_sections = add_activity_to_slack_sections(slack_sections, activity_data)
    
    print("Slack message sections:")
    for section in slack_sections:
        print(f"  {section}")
