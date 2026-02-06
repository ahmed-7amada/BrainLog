# Data Model: Android-Only Codebase Cleanup with Maestro E2E Testing

**Feature**: 004-android-cleanup-e2e
**Date**: 2026-02-06
**Status**: Complete

## Overview

This feature does not introduce new application data models. Instead, it defines the structure for E2E testing artifacts (Maestro flows) and the testID mapping for all 38 screens.

## E2E Testing Entities

### MaestroFlow

A YAML file defining a sequence of user interactions and assertions.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Flow identifier (filename without .yaml) |
| appId | string | Android package name (com.brainlog) |
| steps | Step[] | Ordered list of test actions |

**Validation Rules**:
- Flow name must match file name
- appId must be `com.brainlog`
- Steps must be non-empty

### MaestroStep

An individual action within a flow.

| Attribute | Type | Description |
|-----------|------|-------------|
| action | enum | One of: launchApp, tapOn, inputText, assertVisible, assertNotVisible, waitForAnimationToEnd, back, scroll |
| target | string? | Element selector (id: "testID") |
| text | string? | Text input or assertion value |
| direction | enum? | Scroll direction (UP, DOWN, LEFT, RIGHT) |

### TestSuite

A master configuration that runs multiple flows in sequence.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Suite identifier |
| flows | string[] | Ordered list of flow file paths |
| config | Config | Global test configuration |

## testID Registry

Complete mapping of testIDs across all 38 screens. Format: `screenName_elementType_identifier`

### Auth Screens

#### LoginScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| login_button_googleSignIn | TouchableOpacity | Google Sign-In button |
| login_text_title | Text | Screen title |
| login_text_error | Text | Error message display |
| login_indicator_loading | ActivityIndicator | Loading spinner |

### Dashboard Screens

#### DashboardScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| dashboard_card_todayProgress | View | Today's progress summary card |
| dashboard_card_streakCounter | View | Current streak display |
| dashboard_card_quickActions | View | Quick action buttons container |
| dashboard_button_startReview | TouchableOpacity | Start review session |
| dashboard_button_addNote | TouchableOpacity | Quick add note |
| dashboard_list_recentActivity | FlatList | Recent activity feed |
| dashboard_text_greeting | Text | User greeting |

### Notes Screens

#### NoteListScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| noteList_list_notes | FlatList | Notes list container |
| noteList_item_{index} | TouchableOpacity | Individual note item |
| noteList_button_create | TouchableOpacity | Create new note FAB |
| noteList_input_search | TextInput | Search input |
| noteList_text_empty | Text | Empty state message |

#### NoteDetailScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| noteDetail_text_title | Text | Note title |
| noteDetail_text_content | Text | Note content |
| noteDetail_button_edit | TouchableOpacity | Edit button |
| noteDetail_button_delete | TouchableOpacity | Delete button |
| noteDetail_button_back | TouchableOpacity | Back navigation |

#### CreateNoteScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| createNote_input_title | TextInput | Title input field |
| createNote_input_content | TextInput | Content input field |
| createNote_button_save | TouchableOpacity | Save button |
| createNote_button_cancel | TouchableOpacity | Cancel button |

#### EditNoteScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| editNote_input_title | TextInput | Title input field |
| editNote_input_content | TextInput | Content input field |
| editNote_button_save | TouchableOpacity | Save button |
| editNote_button_cancel | TouchableOpacity | Cancel button |

### Flashcards Screens

#### FlashcardListScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| flashcardList_list_cards | FlatList | Flashcards list |
| flashcardList_item_{index} | TouchableOpacity | Individual flashcard item |
| flashcardList_button_create | TouchableOpacity | Create flashcard FAB |
| flashcardList_button_startReview | TouchableOpacity | Start review session |
| flashcardList_text_empty | Text | Empty state message |

#### FlashcardDetailScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| flashcardDetail_text_front | Text | Front content |
| flashcardDetail_text_back | Text | Back content |
| flashcardDetail_button_edit | TouchableOpacity | Edit button |
| flashcardDetail_button_delete | TouchableOpacity | Delete button |
| flashcardDetail_button_back | TouchableOpacity | Back navigation |

#### CreateFlashcardScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| createFlashcard_input_front | TextInput | Front content input |
| createFlashcard_input_back | TextInput | Back content input |
| createFlashcard_button_save | TouchableOpacity | Save button |
| createFlashcard_button_cancel | TouchableOpacity | Cancel button |

#### EditFlashcardScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| editFlashcard_input_front | TextInput | Front content input |
| editFlashcard_input_back | TextInput | Back content input |
| editFlashcard_button_save | TouchableOpacity | Save button |
| editFlashcard_button_cancel | TouchableOpacity | Cancel button |

#### ReviewSessionScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| reviewSession_card_flashcard | View | Current flashcard display |
| reviewSession_button_showAnswer | TouchableOpacity | Show answer button |
| reviewSession_button_easy | TouchableOpacity | Easy rating |
| reviewSession_button_good | TouchableOpacity | Good rating |
| reviewSession_button_hard | TouchableOpacity | Hard rating |
| reviewSession_button_again | TouchableOpacity | Again rating |
| reviewSession_text_progress | Text | Progress indicator |
| reviewSession_button_exit | TouchableOpacity | Exit review |

#### ReviewCompleteScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| reviewComplete_text_summary | Text | Session summary |
| reviewComplete_text_cardsReviewed | Text | Cards reviewed count |
| reviewComplete_button_done | TouchableOpacity | Done button |
| reviewComplete_button_reviewMore | TouchableOpacity | Review more button |

### Bookmarks Screens

#### BookmarkListScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| bookmarkList_list_bookmarks | FlatList | Bookmarks list |
| bookmarkList_item_{index} | TouchableOpacity | Individual bookmark |
| bookmarkList_button_create | TouchableOpacity | Create bookmark FAB |
| bookmarkList_text_empty | Text | Empty state message |

#### BookmarkDetailScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| bookmarkDetail_text_title | Text | Bookmark title |
| bookmarkDetail_text_url | Text | Bookmark URL |
| bookmarkDetail_button_open | TouchableOpacity | Open in browser |
| bookmarkDetail_button_edit | TouchableOpacity | Edit button |
| bookmarkDetail_button_delete | TouchableOpacity | Delete button |

#### CreateBookmarkScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| createBookmark_input_title | TextInput | Title input |
| createBookmark_input_url | TextInput | URL input |
| createBookmark_button_save | TouchableOpacity | Save button |
| createBookmark_button_cancel | TouchableOpacity | Cancel button |

### Voice Notes Screens

#### VoiceNoteListScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| voiceNoteList_list_notes | FlatList | Voice notes list |
| voiceNoteList_item_{index} | TouchableOpacity | Individual voice note |
| voiceNoteList_button_record | TouchableOpacity | Record new FAB |
| voiceNoteList_text_empty | Text | Empty state message |

#### VoiceNoteDetailScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| voiceNoteDetail_text_title | Text | Voice note title |
| voiceNoteDetail_text_duration | Text | Duration display |
| voiceNoteDetail_button_play | TouchableOpacity | Play button |
| voiceNoteDetail_button_pause | TouchableOpacity | Pause button |
| voiceNoteDetail_button_delete | TouchableOpacity | Delete button |
| voiceNoteDetail_slider_progress | Slider | Playback progress |

#### RecordVoiceNoteScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| recordVoiceNote_button_record | TouchableOpacity | Start recording |
| recordVoiceNote_button_stop | TouchableOpacity | Stop recording |
| recordVoiceNote_button_save | TouchableOpacity | Save recording |
| recordVoiceNote_button_discard | TouchableOpacity | Discard recording |
| recordVoiceNote_text_duration | Text | Recording duration |
| recordVoiceNote_indicator_recording | View | Recording indicator |

### Videos Screens

#### VideoListScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| videoList_list_videos | FlatList | Videos list |
| videoList_item_{index} | TouchableOpacity | Individual video |
| videoList_button_upload | TouchableOpacity | Upload video FAB |
| videoList_text_empty | Text | Empty state message |

#### VideoDetailScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| videoDetail_video_player | Video | Video player component |
| videoDetail_button_play | TouchableOpacity | Play button |
| videoDetail_button_pause | TouchableOpacity | Pause button |
| videoDetail_button_delete | TouchableOpacity | Delete button |
| videoDetail_text_title | Text | Video title |

#### UploadVideoScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| uploadVideo_button_selectFile | TouchableOpacity | Select file button |
| uploadVideo_input_title | TextInput | Title input |
| uploadVideo_button_upload | TouchableOpacity | Upload button |
| uploadVideo_progress_upload | ProgressBar | Upload progress |
| uploadVideo_button_cancel | TouchableOpacity | Cancel button |

### Memorize Screens

#### MemorizeListScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| memorizeList_list_items | FlatList | Memorize items list |
| memorizeList_item_{index} | TouchableOpacity | Individual item |
| memorizeList_button_create | TouchableOpacity | Create item FAB |
| memorizeList_button_review | TouchableOpacity | Start review |
| memorizeList_text_empty | Text | Empty state message |

#### MemorizeDetailScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| memorizeDetail_text_content | Text | Content to memorize |
| memorizeDetail_button_edit | TouchableOpacity | Edit button |
| memorizeDetail_button_delete | TouchableOpacity | Delete button |

#### CreateMemorizeItemScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| createMemorizeItem_input_content | TextInput | Content input |
| createMemorizeItem_button_save | TouchableOpacity | Save button |
| createMemorizeItem_button_cancel | TouchableOpacity | Cancel button |

#### MemorizeReviewScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| memorizeReview_text_content | Text | Content display |
| memorizeReview_button_reveal | TouchableOpacity | Reveal answer |
| memorizeReview_button_correct | TouchableOpacity | Mark correct |
| memorizeReview_button_incorrect | TouchableOpacity | Mark incorrect |
| memorizeReview_text_progress | Text | Review progress |

### Calendar Screens

#### CalendarScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| calendar_calendar_main | Calendar | Calendar component |
| calendar_button_today | TouchableOpacity | Go to today |
| calendar_button_prevMonth | TouchableOpacity | Previous month |
| calendar_button_nextMonth | TouchableOpacity | Next month |
| calendar_day_{date} | TouchableOpacity | Calendar day cell |

#### DayDetailScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| dayDetail_text_date | Text | Selected date |
| dayDetail_list_events | FlatList | Day events list |
| dayDetail_item_{index} | TouchableOpacity | Individual event |
| dayDetail_text_empty | Text | No events message |

### Profile Screens

#### ProfileScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| profile_image_avatar | Image | User avatar |
| profile_text_name | Text | User name |
| profile_text_email | Text | User email |
| profile_button_settings | TouchableOpacity | Settings button |
| profile_button_habits | TouchableOpacity | Habits button |
| profile_button_badges | TouchableOpacity | Badges button |
| profile_button_statistics | TouchableOpacity | Statistics button |
| profile_button_logout | TouchableOpacity | Logout button |

#### SettingsScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| settings_toggle_notifications | Switch | Notifications toggle |
| settings_toggle_darkMode | Switch | Dark mode toggle |
| settings_button_clearCache | TouchableOpacity | Clear cache button |
| settings_button_exportData | TouchableOpacity | Export data button |
| settings_text_version | Text | App version |

#### BadgesScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| badges_list_badges | FlatList | Badges list |
| badges_item_{index} | View | Individual badge |
| badges_text_empty | Text | No badges message |

#### StatisticsScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| statistics_chart_progress | Chart | Progress chart |
| statistics_text_totalCards | Text | Total cards count |
| statistics_text_studyTime | Text | Study time stats |
| statistics_text_streak | Text | Current streak |

#### HabitsScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| habits_list_habits | FlatList | Habits list |
| habits_item_{index} | TouchableOpacity | Individual habit |
| habits_button_create | TouchableOpacity | Create habit FAB |
| habits_text_empty | Text | No habits message |

#### CreateHabitScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| createHabit_input_name | TextInput | Habit name input |
| createHabit_input_frequency | Picker | Frequency selector |
| createHabit_button_save | TouchableOpacity | Save button |
| createHabit_button_cancel | TouchableOpacity | Cancel button |

#### EditHabitScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| editHabit_input_name | TextInput | Habit name input |
| editHabit_input_frequency | Picker | Frequency selector |
| editHabit_button_save | TouchableOpacity | Save button |
| editHabit_button_delete | TouchableOpacity | Delete button |
| editHabit_button_cancel | TouchableOpacity | Cancel button |

### Search Screen

#### SearchScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| search_input_query | TextInput | Search input |
| search_button_search | TouchableOpacity | Search button |
| search_list_results | FlatList | Search results |
| search_item_{index} | TouchableOpacity | Individual result |
| search_text_empty | Text | No results message |
| search_filter_type | Picker | Content type filter |

### Daily Log Screen

#### DailyLogScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| dailyLog_text_date | Text | Current date |
| dailyLog_list_entries | FlatList | Log entries |
| dailyLog_input_entry | TextInput | New entry input |
| dailyLog_button_addEntry | TouchableOpacity | Add entry button |
| dailyLog_item_{index} | View | Individual entry |

### Insights Screens

#### WeeklySummaryListScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| weeklySummaryList_list_summaries | FlatList | Summaries list |
| weeklySummaryList_item_{index} | TouchableOpacity | Individual summary |
| weeklySummaryList_text_empty | Text | No summaries message |

#### WeeklySummaryScreen
| testID | Element Type | Description |
|--------|--------------|-------------|
| weeklySummary_text_weekRange | Text | Week date range |
| weeklySummary_chart_activity | Chart | Activity chart |
| weeklySummary_text_highlights | Text | Week highlights |
| weeklySummary_text_goals | Text | Goals progress |

### Navigation Elements

#### MainTabs (Bottom Tab Navigator)
| testID | Element Type | Description |
|--------|--------------|-------------|
| mainTabs_tab_dashboard | TouchableOpacity | Dashboard tab |
| mainTabs_tab_notes | TouchableOpacity | Notes tab |
| mainTabs_tab_flashcards | TouchableOpacity | Flashcards tab |
| mainTabs_tab_calendar | TouchableOpacity | Calendar tab |
| mainTabs_tab_profile | TouchableOpacity | Profile tab |

### Common Components

#### Toast/Snackbar
| testID | Element Type | Description |
|--------|--------------|-------------|
| toast_container | View | Toast container |
| toast_text_message | Text | Toast message |
| toast_button_dismiss | TouchableOpacity | Dismiss button |

#### Modal
| testID | Element Type | Description |
|--------|--------------|-------------|
| modal_container | View | Modal container |
| modal_button_close | TouchableOpacity | Close button |
| modal_button_confirm | TouchableOpacity | Confirm action |
| modal_button_cancel | TouchableOpacity | Cancel action |

#### Loading/Error States
| testID | Element Type | Description |
|--------|--------------|-------------|
| loading_indicator | ActivityIndicator | Loading spinner |
| error_container | View | Error state container |
| error_text_message | Text | Error message |
| error_button_retry | TouchableOpacity | Retry button |
| offline_indicator | View | Offline status banner |

## Total testID Count

| Category | Count |
|----------|-------|
| Auth | 4 |
| Dashboard | 7 |
| Notes | 17 |
| Flashcards | 30 |
| Bookmarks | 12 |
| Voice Notes | 16 |
| Videos | 13 |
| Memorize | 15 |
| Calendar | 11 |
| Profile | 32 |
| Search | 7 |
| Daily Log | 6 |
| Insights | 8 |
| Navigation | 5 |
| Common | 12 |
| **Total** | **195** |
