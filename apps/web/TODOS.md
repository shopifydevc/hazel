- Add convex client tests to our sdk
- Move Pinned Message back to separate table


# Chat 
- Add inline code highlighting
- Replace Reaction Badges with Pills

# Features
- File uploads with convex
- Readd last read message
- Call Feature
    - Start call in channel
    - Show active call in channel + show call history

- Fork Presence Component and add a method to get if specific accountId is online in roomId
- Add Invite Link

# Fixes
- Closing Image Dialog rerenders/refetches the whole page



# Improvements 



- Delete Notification after it was seen (maybe just a simple cron cleanup job)
- Move all mutations to tanstack query

- Add more presence types (away, busy)
- Improve mobile app UI and add settings in both web + mobile to mute Notifications