import { createContext, useContext, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';

export type Language = 'ge' | 'en' | 'ru';

const languages: Language[] = ['ge', 'en', 'ru'];
const defaultLanguage: Language = 'ge';

const translations: Record<string, string> = {
  'Free giving in Georgia': 'რასაცა გასცემ შენია, რაც არა დაკარგულია',
  Home: 'მთავარი',
  Create: 'დამატება...',
  Profile: 'პროფილი',
  Admin: 'ადმინი',
  Login: 'შესვლა',
  Register: 'რეგისტრაცია',
  Privacy: 'კონფიდენციალურობა',
  Terms: 'პირობები',
  Safety: 'უსაფრთხოება',
  Contact: 'კონტაქტი',
  'Legal and trust': 'იურიდიული ინფორმაცია და ნდობა',
  'Log out': 'გასვლა',
  'Log out?': 'გსურთ გასვლა?',
  'Do you really want to log out of your account?':
    'ნამდვილად გსურთ ანგარიშიდან გასვლა?',
  'Logging out...': 'გასვლა...',
  'New reservation activity': 'ახალი აქტივობა ჯავშანზე',
  Notifications: 'შეტყობინებები',
  unread: 'წაუკითხავი',
  'No unread notifications': 'წაუკითხავი შეტყობინებები არ არის',
  'Mark all read': 'ყველას წაკითხულად მონიშვნა',
  'Loading notifications': 'შეტყობინებები იტვირთება',
  'Could not load notifications': 'შეტყობინებები ვერ ჩაიტვირთა',
  'No notifications yet': 'შეტყობინებები ჯერ არ არის',
  'New reservation request': 'ახალი ჯავშნის მოთხოვნა',
  'Reservation accepted': 'ჯავშანი მიღებულია',
  'Reservation declined': 'ჯავშანი უარყოფილია',
  'Reservation cancelled': 'ჯავშანი გაუქმდა',
  'Reservation completed': 'ჯავშანი დასრულდა',
  'Someone reserved one of your items.': 'ვიღაცამ თქვენი ნივთი დაჯავშნა.',
  'Your reservation request was accepted.':
    'თქვენი ჯავშნის მოთხოვნა მიღებულია.',
  'Your reservation request was declined.':
    'თქვენი ჯავშნის მოთხოვნა უარყოფილია.',
  'A reservation was cancelled.': 'ჯავშანი გაუქმდა.',
  'The item was marked as given.': 'ნივთი გაჩუქებულად მოინიშნა.',
  'Primary navigation': 'მთავარი ნავიგაცია',
  'Mobile navigation': 'მობილური ნავიგაცია',
  'Skip to content': 'კონტენტზე გადასვლა',
  'Switch to dark mode': 'მუქ რეჟიმზე გადართვა',
  'Switch to light mode': 'ნათელ რეჟიმზე გადართვა',
  Language: 'ენა',

  'Free items in Georgia': 'ნივთების გაცემა-გაჩუქება',
  'Community giving': 'ქურდებს სიცოცხლე',
  'Local and free': 'დავეხმაროთ ერთმანეთს',
  'Georgia-wide': 'მთელ საქართველოში',
  'Find unwanted items people are giving away and help keep useful things out of waste.':
    'არ გადააგდო, გააჩუქე!',
  'Loading free items': 'უფასო ნივთები იტვირთება',
  'Gaachuqe is loading the latest posts.':
    'Gaachuqe ახალ განცხადებებს ტვირთავს.',
  'Could not load feed': 'განცხადებები ვერ ჩაიტვირთა',
  'Please try again.': 'გთხოვთ სცადოთ თავიდან.',
  'No free items found': 'ნივთები ვერ მოიძებნა',
  'Try changing your search or filters to see more available items.':
    'სცადეთ ძიების ან ფილტრების შეცვლა მეტი ნივთის სანახავად.',
  'Loading more items': 'მეტი ნივთი იტვირთება',
  'More free items are being loaded.': 'იტვირთება მეტი უფასო ნივთი.',
  'Loading...': 'იტვირთება...',
  'Load more': 'მეტის ჩატვირთვა',
  'Show more': 'მეტის ნახვა',
  'Free item feed': 'უფასო ნივთების სია',
  'Give freely. Build community.': 'გააჩუქე თავისუფლად. შექმენი ერთობა.',
  'Free things, shared kindly.': 'უფასო ნივთები, კეთილად გაზიარებული.',
  'A community marketplace for giving away what you no longer need across Georgia.':
    'საზოგადოებრივი სივრცე საქართველოში ნივთების გასაჩუქებლად, რომლებიც აღარ გჭირდებათ.',
  'Search free items near you...': 'მოძებნეთ უფასო ნივთები ახლოს...',
  Search: 'ძიება',
  'All Georgia': 'მთელი საქართველო',
  'Home statistics': 'მთავარი გვერდის სტატისტიკა',
  'items currently showing': 'ამჟამად ნაჩვენები ნივთი',
  'ways to give': 'გაჩუქების კატეგორია',
  'cities across Georgia': 'ქალაქი საქართველოში',
  'Trending categories': 'პოპულარული კატეგორიები',
  'Recently added': 'ახლახან დამატებული',
  available: 'ხელმისაწვდომია',

  Filters: 'ფილტრები',
  'Feed filters': 'განცხადებების ფილტრები',
  Clear: 'გასუფთავება',
  Open: 'გახსნა',
  Close: 'დახურვა',
  'Search, category, city, and status':
    'ძიება, კატეგორიები, ადგილმდებარეობა და ნივთის სტატუსი',
  'Search, category, and city': 'ძიება, კატეგორიები და ადგილმდებარეობა',
  active: 'აქტიური',
  'Search free items': 'უფასო ნივთების ძიება',
  Category: 'კატეგორია',
  City: 'ქალაქი',
  Status: 'სტატუსი',
  'Search by city': 'ქალაქით ძიება',
  'Search city': 'ქალაქის ძიება',
  'All categories': 'ყველა კატეგორია',
  'All cities': 'ყველა ქალაქი',
  Clothing: 'ტანსაცმელი',
  Electronics: 'ელექტრონიკა',
  Books: 'წიგნები',
  Children: 'ბავშვები',
  Sports: 'სპორტი',
  Other: 'სხვა',
  HomeCategory: 'სახლი',
  'Any status': 'ნებისმიერი სტატუსი',
  Available: 'ხელმისაწვდომია',
  Reserved: 'დაჯავშნილია',
  Given: 'გაჩუქებულია',
  Archived: 'არქივშია',
  OpenStatus: 'ღია',
  Pending: 'მოლოდინში',
  Accepted: 'დადასტურებულია',
  Declined: 'უარყოფილია',
  Completed: 'დასრულებულია',
  Cancelled: 'გაუქმებულია',
  Accept: 'დადასტურება',
  Reject: 'უარყოფა',
  'Reservation requests': 'ჯავშნის მოთხოვნები',
  'Accept reservation?': 'დავადასტუროთ ჯავშანი?',
  'Accept this reservation request?': 'გსურთ ამ ჯავშნის მოთხოვნის დადასტურება?',
  'Reject reservation?': 'უარვყოთ ჯავშანი?',
  'Reject this reservation request?': 'გსურთ ამ ჯავშნის მოთხოვნის უარყოფა?',
  'Cancel reservation': 'ჯავშნის გაუქმება',
  'Cancel this accepted reservation?': 'გსურთ დადასტურებული ჯავშნის გაუქმება?',
  'Mark completed': 'დასრულებულად მონიშვნა',
  'Complete reservation?': 'დავასრულოთ ჯავშანი?',
  'Mark this reservation as completed?':
    'გსურთ ამ ჯავშნის დასრულებულად მონიშვნა?',
  'Could not update reservation.': 'ჯავშნის განახლება ვერ მოხერხდა.',
  'Reservation expires in': 'ჯავშანი იწურება',
  h: 'სთ',
  m: 'წთ',
  s: 'წმ',

  'Create Post': 'განცხადების დამატება',
  'Give away an unwanted item for free.': 'აჩუქე არასაჭირო ნივთი უფასოდ.',
  'Item details': 'ნივთის დეტალები',
  'Use a clear title and honest condition details.':
    'გამოიყენეთ გასაგები სათაური და აღწერეთ ნივთის მდგომარეობა.',
  Title: 'სათაური (ნივთის დასახელება)',
  'Example: Wooden chair in good condition':
    'მაგალითად: ხის სკამი კარგ მდგომარეობაში',
  Description: 'აღწერა (არ დაამატოთ თქვენი ნომერი აღწერაში)',
  'Describe condition, pickup details, and what is included.':
    'აღწერეთ მდგომარეობა, აღების დეტალები და რა შედის განცხადებაში.',
  'Do not add your phone number here. People can contact you through the post.':
    'აქ არ დაამატოთ ტელეფონის ნომერი. მომხმარებლები დაგიკავშირდებიან განცხადებიდან.',
  Photos: 'ფოტოები',
  'Add photos': 'ფოტოების დამატება',
  'Create post': 'განცხადების დამატება',
  'Creating post...': 'განცხადება იქმნება...',
  'Post could not be created.': 'განცხადება ვერ შეიქმნა.',
  'Photos could not be processed.': 'ფოტოები ვერ დამუშავდა.',
  'You must be logged in to create a post.':
    'განცხადების დასამატებლად უნდა შეხვიდეთ სისტემაში.',
  'Add 1 to 5 photos. Images are compressed before upload.':
    'დაამატეთ 1-დან 5-მდე ფოტო. ატვირთვამდე ფოტოები იკუმშება.',
  'Remove photo': 'ფოტოს წაშლა',
  'Choose photos': 'ფოტოების არჩევა',
  'slots left': 'ადგილი დარჩა',
  'Choose the closest category so people can find it.':
    'აირჩიეთ ყველაზე ახლო კატეგორია, რომ ნივთი მარტივად მოიძებნოს.',
  'Pickup city': 'აღების ქალაქი',
  'Pick the city where the item can be collected.':
    'აირჩიეთ ქალაქი, სადაც ნივთის აღება შეიძლება.',
  'No matching city': 'ქალაქი ვერ მოიძებნა',

  'Loading item': 'ნივთი იტვირთება',
  'Gaachuqe is loading item details.': 'Gaachuqe ნივთის დეტალებს ტვირთავს.',
  'Item not found': 'ნივთი ვერ მოიძებნა',
  'This item could not be loaded.': 'ნივთი ვერ ჩაიტვირთა.',
  Back: 'უკან',
  Date: 'თარიღი',
  Expires: 'იწურება',
  'Gaachuqe member': 'Gaachuqe-ის წევრი',
  'Owner information is limited': 'მფლობელის ინფორმაცია შეზღუდულია',
  'Reservation active': 'ჯავშანი აქტიურია',
  'Contact the owner to arrange pickup.':
    'დაუკავშირდით მფლობელს ნივთის ასაღებად.',
  Call: 'დარეკვა',
  Edit: 'რედაქტირება',
  Save: 'შენახვა',
  'Saving...': 'ინახება...',
  Cancel: 'გაუქმება',
  Delete: 'წაშლა',
  'Deleting...': 'იშლება...',
  'Delete post': 'განცხადების წაშლა',
  'Delete post?': 'წავშალოთ განცხადება?',
  'Mark given': 'გაჩუქებულად მონიშვნა',
  'Mark item as given?': 'მოვნიშნოთ ნივთი გაჩუქებულად?',
  Report: 'რეპორტი',
  Reserve: 'დაჯავშნა',
  'Reserve item?': 'დავჯავშნოთ ნივთი?',
  'Reserving...': 'ჯავშანი იქმნება...',
  Unreserve: 'ჯავშნის გაუქმება',
  'Cancel reservation?': 'გავაუქმოთ ჯავშანი?',
  'Cancelling...': 'უქმდება...',
  'Log in to reserve': 'დაჯავშნისთვის შედით',
  'Report item': 'ნივთის დარეპორტება',
  'Reports are reviewed by admins and help keep the marketplace safe.':
    'რეპორტებს ადმინები განიხილავენ და ისინი პლატფორმის უსაფრთხოებას ეხმარება.',
  Subject: 'თემა',
  Details: 'დეტალები',
  'Submit report': 'რეპორტის გაგზავნა',
  'Submitting...': 'იგზავნება...',
  'Could not reserve item.': 'ნივთის დაჯავშნა ვერ მოხერხდა.',
  'Could not cancel reservation.': 'ჯავშნის გაუქმება ვერ მოხერხდა.',
  'Could not mark item as given.': 'ნივთის გაჩუქებულად მონიშვნა ვერ მოხერხდა.',
  'Could not delete item.': 'ნივთის წაშლა ვერ მოხერხდა.',
  'Could not update item.': 'ნივთის განახლება ვერ მოხერხდა.',
  'Could not submit report.': 'რეპორტის გაგზავნა ვერ მოხერხდა.',
  'Log in to reserve this item.': 'ამ ნივთის დასაჯავშნად შედით სისტემაში.',
  'Reservation was not found.': 'ჯავშანი ვერ მოიძებნა.',
  'Post was not found.': 'განცხადება ვერ მოიძებნა.',
  'Log in to report this item.': 'ამ ნივთის დასარეპორტებლად შედით სისტემაში.',
  'Mark this item as given? Active reservations will be completed.':
    'მოვნიშნოთ ეს ნივთი გაჩუქებულად? აქტიური ჯავშნები დასრულდება.',
  'Delete this post permanently? This cannot be undone.':
    'წავშალოთ ეს განცხადება სამუდამოდ? ეს ქმედება შეუქცევადია.',
  'Cancel your reservation for this item?': 'გავაუქმოთ ამ ნივთის ჯავშანი?',
  'Reserve this item? The owner will be notified.':
    'დაჯავშნოთ ეს ნივთი? მფლობელი მიიღებს შეტყობინებას.',

  'Use your email and password to access Gaachuqe.':
    'Gaachuqe-ში შესასვლელად გამოიყენეთ ელფოსტა და პაროლი.',
  Email: 'ელფოსტა',
  Password: 'პაროლი',
  'Forgot password?': 'დაგავიწყდათ პაროლი?',
  'Reset password': 'პაროლის აღდგენა',
  'Enter your email and we will send a password reset link.':
    'შეიყვანეთ ელფოსტა და გამოგიგზავნით პაროლის აღდგენის ბმულს.',
  'If an account exists for this email, a reset link was sent.':
    'თუ ამ ელფოსტაზე ანგარიში არსებობს, აღდგენის ბმული გაიგზავნა.',
  'Send reset link': 'აღდგენის ბმულის გაგზავნა',
  'Sending...': 'იგზავნება...',
  'Back to login': 'შესვლაზე დაბრუნება',
  'Password reset email could not be sent.':
    'პაროლის აღდგენის ელფოსტა ვერ გაიგზავნა.',
  'Set new password': 'ახალი პაროლის დაყენება',
  'Enter a new password for your account.':
    'შეიყვანეთ ახალი პაროლი თქვენი ანგარიშისთვის.',
  'New password': 'ახალი პაროლი',
  'Confirm password': 'დაადასტურეთ პაროლი',
  'Save new password': 'ახალი პაროლის შენახვა',
  'Password updated. You can now log in.':
    'პაროლი განახლდა. ახლა შეგიძლიათ შეხვიდეთ.',
  'Password could not be updated.': 'პაროლი ვერ განახლდა.',
  'Confirm your new password.': 'დაადასტურეთ ახალი პაროლი.',
  'Passwords do not match.': 'პაროლები არ ემთხვევა.',
  'No account?': 'არ გაქვთ ანგარიში?',
  'Login failed.': 'შესვლა ვერ მოხერხდა.',
  'Email or password is incorrect.': 'ელფოსტა ან პაროლი არასწორია.',
  'An account with this email already exists.':
    'ამ ელფოსტით ანგარიში უკვე არსებობს.',
  'Use a stronger password.': 'გამოიყენეთ უფრო ძლიერი პაროლი.',
  'Confirm your email before logging in.':
    'შესვლამდე დაადასტურეთ თქვენი ელფოსტა.',
  'This link has expired. Please request a new one.':
    'ეს ბმული ვადაგასულია. მოითხოვეთ ახალი ბმული.',
  'You do not have permission to do that.':
    'ამ მოქმედების შესრულების უფლება არ გაქვთ.',
  'Upload failed. Please try again.': 'ატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.',
  'The selected file is too large.': 'არჩეული ფაილი ძალიან დიდია.',
  'Check your internet connection and try again.':
    'შეამოწმეთ ინტერნეტკავშირი და სცადეთ ხელახლა.',
  'Fill in all required fields.': 'შეავსეთ ყველა სავალდებულო ველი.',
  'Something went wrong. Please try again.':
    'რაღაც შეცდომა მოხდა. სცადეთ ხელახლა.',
  'Logout failed.': 'გასვლა ვერ მოხერხდა.',
  'Create an account with your name, email, phone number, and password.':
    'შექმენით ანგარიში',
  'Display name': 'სახელი',
  'Phone number': 'ტელეფონის ნომერი',
  'Create account': 'ანგარიშის შექმნა',
  'Creating account...': 'ანგარიში იქმნება...',
  'Log in': 'შესვლა',
  'Logging in...': 'შესვლა...',
  'First name': 'სახელი',
  'Last name': 'გვარი',
  'Already registered?': 'უკვე დარეგისტრირებული ხართ?',
  'Registration failed.': 'რეგისტრაცია ვერ მოხერხდა.',

  'Loading profile': 'პროფილი იტვირთება',
  'Gaachuqe is loading your account.': 'Gaachuqe თქვენს ანგარიშს ტვირთავს.',
  'Could not load profile': 'პროფილი ვერ ჩაიტვირთა',
  'Phone unavailable': 'ტელეფონი მიუწვდომელია',
  'Profile statistics': 'პროფილის სტატისტიკა',
  'Total posts': 'სულ განცხადებები',
  'Reserved posts': 'დაჯავშნილი განცხადებები',
  'My reservations': 'ჩემი ჯავშნები',
  'My Posts': 'ჩემი განცხადებები',
  'Reserved Items': 'დაჯავშნილი ნივთები',
  Settings: 'პარამეტრები',
  'No posts yet': 'განცხადებები ჯერ არ არის',
  'Create a post when you have an item to give away.':
    'დაამატეთ განცხადება, როცა გასაჩუქებელი ნივთი გაქვთ.',
  Statistics: 'სტატისტიკა',
  View: 'ნახვა',
  'No reserved items': 'დაჯავშნილი ნივთები არ არის',
  'Reserved items will appear here.': 'დაჯავშნილი ნივთები აქ გამოჩნდება.',
  'Account settings': 'ანგარიშის პარამეტრები',
  'Save settings': 'პარამეტრების შენახვა',
  'Settings saved.': 'პარამეტრები შენახულია.',
  'Delete account': 'ანგარიშის წაშლა',
  'Permanently remove your profile, posts, reservations, and post images.':
    'სამუდამოდ წაშლის თქვენს პროფილს, განცხადებებს, ჯავშნებს და ფოტოებს.',
  'Your account': 'თქვენი ანგარიში',
  Location: 'მდებარეობა',
  reservations: 'ჯავშანი',
  'Could not delete post.': 'განცხადების წაშლა ვერ მოხერხდა.',
  'Could not mark post as given.':
    'განცხადების გაჩუქებულად მონიშვნა ვერ მოხერხდა.',
  'Unavailable item': 'მიუწვდომელი ნივთი',
  'Location unavailable': 'მდებარეობა მიუწვდომელია',
  'Settings could not be saved.': 'პარამეტრები ვერ შეინახა.',
  'Delete account permanently': 'ანგარიშის სამუდამოდ წაშლა',
  'This removes your profile, posts, post images, and reservations. This action cannot be undone.':
    'ეს წაშლის თქვენს პროფილს, განცხადებებს, ფოტოებს და ჯავშნებს. ქმედება შეუქცევადია.',
  'Type DELETE to confirm': 'დასადასტურებლად აკრიფეთ DELETE',
  'Account could not be deleted.': 'ანგარიში ვერ წაიშალა.',

  'Admin dashboard': 'ადმინის პანელი',
  'Review users, moderate posts, and triage reports.':
    'გადახედეთ მომხმარებლებს, მართეთ განცხადებები და განიხილეთ რეპორტები.',
  'Loading admin data': 'ადმინის მონაცემები იტვირთება',
  'Gaachuqe is loading moderation records.':
    'Gaachuqe მოდერაციის ჩანაწერებს ტვირთავს.',
  'Could not load admin tools': 'ადმინის ხელსაწყოები ვერ ჩაიტვირთა',
  Users: 'მომხმარებლები',
  Posts: 'განცხადებები',
  Reports: 'რეპორტები',
  'Open reports': 'ღია რეპორტები',
  Reservations: 'ჯავშნები',
  'Expired posts': 'ვადაგასული განცხადებები',
  User: 'მომხმარებელი',
  Role: 'როლი',
  Joined: 'შეუერთდა',
  Post: 'განცხადება',
  Owner: 'მფლობელი',
  Action: 'ქმედება',
  'Change status': 'სტატუსის შეცვლა',
  'Update report status?': 'შევცვალოთ რეპორტის სტატუსი?',
  'Update this report status?': 'გსურთ ამ რეპორტის სტატუსის შეცვლა?',
  Reporter: 'რეპორტის ავტორი',
  Created: 'შექმნილია',
  Confirm: 'დადასტურება',
  'Deleted post': 'წაშლილი განცხადება',
  Reviewing: 'განხილვაში',
  Resolved: 'დასრულებული',
  Dismissed: 'უარყოფილი',
  'Admin statistics': 'ადმინის სტატისტიკა',
  'No users': 'მომხმარებლები არ არის',
  'Registered users will appear here.':
    'რეგისტრირებული მომხმარებლები აქ გამოჩნდება.',
  'Search users': 'მომხმარებლების ძიება',
  'No posts': 'განცხადებები არ არის',
  'Posts created by members will appear here.':
    'წევრების შექმნილი განცხადებები აქ გამოჩნდება.',
  'Search posts': 'განცხადებების ძიება',
  'No reports': 'რეპორტები არ არის',
  'Member reports will appear here.': 'წევრების რეპორტები აქ გამოჩნდება.',
  'Search reports': 'რეპორტების ძიება',
  'No matching results': 'შედეგები ვერ მოიძებნა',
  'Try a different search.': 'სცადეთ სხვა საძიებო სიტყვა.',
  Tbilisi: 'თბილისი',
  Batumi: 'ბათუმი',
  Kutaisi: 'ქუთაისი',
  Rustavi: 'რუსთავი',
  Zugdidi: 'ზუგდიდი',
  Gori: 'გორი',
  Poti: 'ფოთი',
  Kobuleti: 'ქობულეთი',
  Samtredia: 'სამტრედია',
  Khashuri: 'ხაშური',
  Senaki: 'სენაკი',
  Zestaponi: 'ზესტაფონი',
  Marneuli: 'მარნეული',
  Telavi: 'თელავი',
  Akhaltsikhe: 'ახალციხე',
  Ozurgeti: 'ოზურგეთი',
  Kaspi: 'კასპი',
  Chiatura: 'ჭიათურა',
  Tsqaltubo: 'წყალტუბო',
  Sagarejo: 'საგარეჯო',
  Gardabani: 'გარდაბანი',
  Borjomi: 'ბორჯომი',
  Tkibuli: 'ტყიბული',
  Khoni: 'ხონი',
  Bolnisi: 'ბოლნისი',
  Akhalkalaki: 'ახალქალაქი',
  Mtskheta: 'მცხეთა',
  Gurjaani: 'გურჯაანი',
  Dusheti: 'დუშეთი',
  Kareli: 'ქარელი',
  Sachkhere: 'საჩხერე',
  Dedoplistsqaro: 'დედოფლისწყარო',
  Lagodekhi: 'ლაგოდეხი',
  Ninotsminda: 'ნინოწმინდა',
  Abasha: 'აბაშა',
  Tsnori: 'წნორი',
  Terjola: 'თერჯოლა',
  Martvili: 'მარტვილი',
  Jvari: 'ჯვარი',
  Khobi: 'ხობი',
  Vani: 'ვანი',
  Baghdati: 'ბაღდათი',
  Vale: 'ვალე',
  Tsalka: 'წალკა',
  Tetritsqaro: 'თეთრიწყარო',
  Dmanisi: 'დმანისი',
  Oni: 'ონი',
  Ambrolauri: 'ამბროლაური',
  Sighnaghi: 'სიღნაღი',
  Tsageri: 'ცაგერი',
  Lentekhi: 'ლენტეხი',
  Stepantsminda: 'სტეფანწმინდა',
  Mestia: 'მესტია',
  Georgia: 'საქართველო',

  'Page not found': 'გვერდი ვერ მოიძებნა',
  'The page you requested does not exist in Gaachuqe.':
    'მოთხოვნილი გვერდი Gaachuqe-ში არ არსებობს.',
  'Go home': 'მთავარზე დაბრუნება',
};

const ruTranslations: Record<string, string> = {
  'Free giving in Georgia': 'Бесплатные вещи в Грузии',
  Home: 'Главная',
  Create: 'Добавить',
  Profile: 'Профиль',
  Admin: 'Админ',
  Login: 'Войти',
  Register: 'Регистрация',
  Privacy: 'Конфиденциальность',
  Terms: 'Условия',
  Safety: 'Безопасность',
  Contact: 'Контакты',
  'Legal and trust': 'Правовая информация и доверие',
  'Log out': 'Выйти',
  'Log out?': 'Выйти?',
  'Do you really want to log out of your account?':
    'Вы действительно хотите выйти из аккаунта?',
  'Logging out...': 'Выход...',
  Notifications: 'Уведомления',
  unread: 'непрочитано',
  'No unread notifications': 'Нет непрочитанных уведомлений',
  'Mark all read': 'Отметить все как прочитанные',
  'Loading notifications': 'Уведомления загружаются',
  'Could not load notifications': 'Не удалось загрузить уведомления',
  'No notifications yet': 'Уведомлений пока нет',
  'New reservation request': 'Новый запрос на бронь',
  'Reservation accepted': 'Бронь подтверждена',
  'Reservation declined': 'Бронь отклонена',
  'Reservation cancelled': 'Бронь отменена',
  'Reservation completed': 'Бронь завершена',
  'Someone reserved one of your items.': 'Кто-то забронировал вашу вещь.',
  'Your reservation request was accepted.': 'Ваш запрос на бронь подтвержден.',
  'Your reservation request was declined.': 'Ваш запрос на бронь отклонен.',
  'A reservation was cancelled.': 'Бронь была отменена.',
  'The item was marked as given.': 'Вещь отмечена как отданная.',
  'Primary navigation': 'Основная навигация',
  'Mobile navigation': 'Мобильная навигация',
  'Skip to content': 'Перейти к содержимому',
  'Switch to dark mode': 'Включить темную тему',
  'Switch to light mode': 'Включить светлую тему',
  Language: 'Язык',

  'Free items in Georgia': 'Бесплатные вещи в Грузии',
  'Community giving': 'Обмен в сообществе',
  'Local and free': 'Локально и бесплатно',
  'Georgia-wide': 'По всей Грузии',
  'Find unwanted items people are giving away and help keep useful things out of waste.':
    'Находите вещи, которые люди отдают бесплатно, и помогайте им получить вторую жизнь.',
  'Loading free items': 'Бесплатные вещи загружаются',
  'Gaachuqe is loading the latest posts.': 'Gaachuqe загружает новые объявления.',
  'Could not load feed': 'Не удалось загрузить ленту',
  'Please try again.': 'Попробуйте еще раз.',
  'No free items found': 'Бесплатные вещи не найдены',
  'Try changing your search or filters to see more available items.':
    'Попробуйте изменить поиск или фильтры.',
  'Loading more items': 'Загружаются еще вещи',
  'More free items are being loaded.': 'Загружаются еще бесплатные вещи.',
  'Loading...': 'Загрузка...',
  'Load more': 'Загрузить еще',
  'Show more': 'Показать еще',
  'Free item feed': 'Лента бесплатных вещей',
  'Give freely. Build community.': 'Отдавайте бесплатно. Создавайте сообщество.',
  'Free things, shared kindly.': 'Бесплатные вещи, которыми делятся по-доброму.',
  'A community marketplace for giving away what you no longer need across Georgia.':
    'Площадка для вещей, которые больше не нужны вам, но могут пригодиться другим в Грузии.',
  'Search free items near you...': 'Искать бесплатные вещи рядом...',
  Search: 'Поиск',
  'All Georgia': 'Вся Грузия',
  'Home statistics': 'Статистика главной страницы',
  'items currently showing': 'вещей сейчас показано',
  'ways to give': 'категорий',
  'cities across Georgia': 'городов в Грузии',
  'Trending categories': 'Популярные категории',
  'Recently added': 'Недавно добавлено',
  available: 'доступно',

  Filters: 'Фильтры',
  'Feed filters': 'Фильтры ленты',
  Clear: 'Очистить',
  Open: 'Открыть',
  Close: 'Закрыть',
  'Search, category, city, and status': 'Поиск, категория, город и статус',
  'Search, category, and city': 'Поиск, категория и город',
  active: 'активно',
  'Search free items': 'Искать бесплатные вещи',
  Category: 'Категория',
  City: 'Город',
  Status: 'Статус',
  'Search by city': 'Поиск по городу',
  'Search city': 'Искать город',
  'All categories': 'Все категории',
  'All cities': 'Все города',
  Clothing: 'Одежда',
  Electronics: 'Электроника',
  Books: 'Книги',
  Children: 'Дети',
  Sports: 'Спорт',
  Other: 'Другое',
  HomeCategory: 'Дом',
  'Any status': 'Любой статус',
  Available: 'Доступно',
  Reserved: 'Забронировано',
  Given: 'Отдано',
  Archived: 'В архиве',
  OpenStatus: 'Открыто',
  Pending: 'В ожидании',
  Accepted: 'Принято',
  Declined: 'Отклонено',
  Completed: 'Завершено',
  Cancelled: 'Отменено',
  Cancel: 'Отмена',
  Confirm: 'Подтвердить',
  Back: 'Назад',
  Delete: 'Удалить',
  'Saving...': 'Сохранение...',
  'Deleting...': 'Удаление...',
  'Cancelling...': 'Отмена...',
  Expires: 'Истекает',

  'Create Post': 'Добавить объявление',
  'Give away an unwanted item for free.': 'Отдайте ненужную вещь бесплатно.',
  'Item details': 'Детали вещи',
  'Use a clear title and honest condition details.':
    'Используйте понятное название и честно опишите состояние.',
  Title: 'Название',
  'Example: Wooden chair in good condition':
    'Например: деревянный стул в хорошем состоянии',
  Description: 'Описание',
  'Describe condition, pickup details, and what is included.':
    'Опишите состояние, детали передачи и что входит в объявление.',
  'Do not add your phone number here. People can contact you through the post.':
    'Не добавляйте номер телефона здесь. Пользователи смогут связаться через объявление.',
  Photos: 'Фото',
  'Add photos': 'Добавить фото',
  'Create post': 'Создать объявление',
  'Creating post...': 'Создание объявления...',
  'Post could not be created.': 'Не удалось создать объявление.',
  'Photos could not be processed.': 'Не удалось обработать фото.',
  'You must be logged in to create a post.':
    'Чтобы создать объявление, нужно войти.',

  'Log in': 'Войти',
  'Logging in...': 'Вход...',
  'Create account': 'Создать аккаунт',
  'Creating account...': 'Создание аккаунта...',
  'Display name': 'Имя',
  'Phone number': 'Номер телефона',
  'First name': 'Имя',
  'Last name': 'Фамилия',
  'Already registered?': 'Уже зарегистрированы?',
  'Registration failed.': 'Регистрация не удалась.',
  'Email or password is incorrect.': 'Неверный email или пароль.',
  'An account with this email already exists.':
    'Аккаунт с таким email уже существует.',
  'Use a stronger password.': 'Используйте более надежный пароль.',
  'Confirm your email before logging in.': 'Подтвердите email перед входом.',
  'This link has expired. Please request a new one.':
    'Ссылка устарела. Запросите новую.',
  'You do not have permission to do that.':
    'У вас нет разрешения на это действие.',
  'Upload failed. Please try again.': 'Загрузка не удалась. Попробуйте еще раз.',
  'The selected file is too large.': 'Выбранный файл слишком большой.',
  'Check your internet connection and try again.':
    'Проверьте интернет-соединение и попробуйте еще раз.',
  'Fill in all required fields.': 'Заполните все обязательные поля.',
  'Something went wrong. Please try again.':
    'Что-то пошло не так. Попробуйте еще раз.',
  'Logout failed.': 'Не удалось выйти.',

  'Loading profile': 'Профиль загружается',
  'Gaachuqe is loading your account.': 'Gaachuqe загружает ваш аккаунт.',
  'Could not load profile': 'Не удалось загрузить профиль',
  'Phone unavailable': 'Телефон недоступен',
  'Profile statistics': 'Статистика профиля',
  'Total posts': 'Всего объявлений',
  'Reserved posts': 'Забронированные объявления',
  'My reservations': 'Мои брони',
  'My Posts': 'Мои объявления',
  'Reserved Items': 'Забронированные вещи',
  Settings: 'Настройки',
  'No posts yet': 'Объявлений пока нет',
  'Create a post when you have an item to give away.':
    'Создайте объявление, когда у вас есть вещь, которую можно отдать.',
  Statistics: 'Статистика',
  View: 'Открыть',
  'No reserved items': 'Забронированных вещей нет',
  'Reserved items will appear here.': 'Забронированные вещи появятся здесь.',
  'Account settings': 'Настройки аккаунта',
  'Save settings': 'Сохранить настройки',
  'Settings saved.': 'Настройки сохранены.',
  'Delete account': 'Удалить аккаунт',
  'Your account': 'Ваш аккаунт',
  Location: 'Локация',
  reservations: 'брони',

  Tbilisi: 'Тбилиси',
  Batumi: 'Батуми',
  Kutaisi: 'Кутаиси',
  Rustavi: 'Рустави',
  Zugdidi: 'Зугдиди',
  Gori: 'Гори',
  Poti: 'Поти',
  Kobuleti: 'Кобулети',
  Telavi: 'Телави',
  Georgia: 'Грузия',

  'Page not found': 'Страница не найдена',
  'The page you requested does not exist in Gaachuqe.':
    'Запрошенной страницы в Gaachuqe не существует.',
  'Go home': 'На главную',
};

type I18nContextValue = {
  language: Language;
  t: (text: string) => string;
  localizedPath: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { lang } = useParams();
  const language = isLanguage(lang) ? lang : null;

  if (!language) {
    return <Navigate replace to={`/${defaultLanguage}`} />;
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        t: (text) => getTranslation(text, language),
        localizedPath: (path) => localizePath(path, language),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}

export function useOptionalI18n() {
  return useContext(I18nContext);
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && languages.includes(value as Language);
}

export function localizePath(path: string, language: Language) {
  if (/^(https?:|mailto:|tel:)/.test(path)) {
    return path;
  }

  if (path === '/') {
    return `/${language}`;
  }

  return `/${language}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getLanguageLocale(language: Language | string) {
  if (language === 'ge') {
    return 'ka-GE';
  }

  if (language === 'ru') {
    return 'ru-RU';
  }

  return 'en';
}

export function getOpenGraphLocale(language: Language | string) {
  if (language === 'ge') {
    return 'ka_GE';
  }

  if (language === 'ru') {
    return 'ru_RU';
  }

  return 'en_US';
}

export function switchLanguagePath(pathname: string, nextLanguage: Language) {
  const parts = pathname.split('/');

  if (isLanguage(parts[1])) {
    parts[1] = nextLanguage;
    return parts.join('/') || `/${nextLanguage}`;
  }

  return `/${nextLanguage}`;
}

function getTranslation(text: string, language: Language) {
  if (language === 'ge') {
    return translations[text] ?? text;
  }

  if (language === 'ru') {
    return ruTranslations[text] ?? text;
  }

  return text;
}
