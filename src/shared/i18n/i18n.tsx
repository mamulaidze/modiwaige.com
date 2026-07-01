import { createContext, useContext, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';

export type Language = 'ge' | 'en' | 'ru';

const languages: Language[] = ['ge', 'en', 'ru'];
const defaultLanguage: Language = 'ge';

const translations: Record<string, string> = {
  'Free giving in Georgia': 'რასაცა გასცემ შენია, რაც არა დაკარგულია',
  Browse: 'დათვალიერება',
  All: 'ყველა',
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
  'Give freely. Build community.': 'საფულე დაასვენე, საიტი შეამოწმე.',
  'Free things, shared kindly.': 'უფასო ნივთები',
  'A community marketplace for giving away what you no longer need across Georgia.':
    'შენთვის ზედმეტი, სხვისთვის საჭირო',
  'Search free items near you...': 'მოძებნეთ უფასო ნივთები ახლოს...',
  Search: 'ძიება',
  'All Georgia': 'მთელი საქართველო',
  'Home statistics': 'მთავარი გვერდის სტატისტიკა',
  'items currently showing': 'ხელმისაწვდომი ნივთი',
  'ways to give': 'კატეგორია',
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
  'Post an item': 'ნივთის დამატება',
  'Give away an unwanted item for free.': 'აჩუქე არასაჭირო ნივთი უფასოდ.',
  'Item details': 'ნივთის დეტალები',
  'Use a clear title and honest condition details.':
    'გამოიყენეთ გასაგები სათაური და აღწერეთ ნივთის მდგომარეობა.',
  Title: 'სათაური (ნივთის დასახელება)',
  'Example: Wooden chair in good condition':
    'მაგალითად: ხის სკამი კარგ მდგომარეობაში',
  Description: 'აღწერა',
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
  'Reservation request sent.': 'ჯავშნის მოთხოვნა გაიგზავნა.',
  'Reservation successful.': 'ჯავშანი წარმატებულია.',
  'The owner will review your request soon.':
    'მფლობელი მალე განიხილავს თქვენს მოთხოვნას.',
  'The item is reserved for you now. The owner can still cancel it.':
    'ნივთი ახლა თქვენთვის არის დაჯავშნილი. მფლობელს გაუქმება მაინც შეუძლია.',
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
  'The owner will be notified and the item may become available again.':
    'მფლობელი მიიღებს შეტყობინებას და ნივთი შეიძლება ისევ ხელმისაწვდომი გახდეს.',
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
  Browse: 'Смотреть',
  All: 'Все',
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
  'Gaachuqe is loading the latest posts.':
    'Gaachuqe загружает новые объявления.',
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
  'Give freely. Build community.':
    'Отдавайте бесплатно. Создавайте сообщество.',
  'Free things, shared kindly.':
    'Бесплатные вещи, которыми делятся по-доброму.',
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
  'Post an item': 'Добавить вещь',
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
  'Upload failed. Please try again.':
    'Загрузка не удалась. Попробуйте еще раз.',
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
  'Reservation request sent.': 'Запрос на бронь отправлен.',
  'Reservation successful.': 'Бронь успешно создана.',
  'The owner will review your request soon.':
    'Владелец скоро рассмотрит ваш запрос.',
  'The item is reserved for you now. The owner can still cancel it.':
    'Вещь уже забронирована за вами. Владелец все еще может отменить бронь.',
  'The owner will be notified and the item may become available again.':
    'Владелец получит уведомление, и вещь может снова стать доступной.',
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

Object.assign(translations, {
  Boosted: 'VIP განცხადება',
  'Boosted only': 'მხოლოდ ტოპ განცხადებები',
  'Boosted posts only': 'მხოლოდ ტოპ განცხადებები',
  'Boost post': 'აბუსთვა',
  'Extend boost': 'ვადის გაგრძელება',
  'Boost expires': 'აბუსთულია ვადამდე',
  'Activate demo boost': 'აბუსთვა',
  'Activating boost...': 'იწევა ტოპში...',
  'Boosted posts appear before regular posts until the boost expires.':
    'ტოპ განცხადება ვადის ამოწურვამდე სიის დასაწყისში გამოჩნდება.',
  'Demo only — no payment will be charged.':
    'დემო რეჟიმი — თანხა არ ჩამოგეჭრებათ.',
  '24 hours': '24 საათი',
  '3 days': '3 დღე',
  '7 days': '7 დღე',
  'Could not boost post.': 'განცხადების ტოპში აწევა ვერ მოხერხდა.',
  'Demo payment completed': 'დემო გადახდა დასრულდა',
  'Your post is now at the top of the feed.':
    'თქვენი განცხადება უკვე სიის დასაწყისშია.',
  'Top placement active until': 'ტოპში იქნება',
  'Your post is in the top section': 'განცხადება ტოპშია',
  'Active until': 'აქტიურია',
  'VIP active': 'VIP აქტიურია',
  'VIP placement activated': 'VIP განთავსება გააქტიურდა',
  'Your post is now shown as a VIP listing.':
    'თქვენი განცხადება ახლა VIP განცხადებად გამოჩნდება.',
  'VIP time left': 'VIP ვადის ამოწურვამდე',
  'VIP placement expired': 'VIP ვადა ამოიწურა',
  d: 'დ',
  Chat: 'ჩატი',
  'Chat with': 'ჩატი:',
  'Chat with owner': 'მფლობელთან ჩატი',
  'Back to item': 'ნივთზე დაბრუნება',
  'Loading chat': 'ჩატი იტვირთება',
  'Your temporary conversation is loading.': 'დროებითი საუბარი იტვირთება.',
  'Chat unavailable': 'ჩატი მიუწვდომელია',
  'This chat could not be opened.': 'ჩატის გახსნა ვერ მოხერხდა.',
  'Chat is not ready yet. Please try again in a moment.':
    'ჩატი ჯერ მზად არ არის. სცადეთ რამდენიმე წამში.',
  'This chat is temporary. Messages are deleted when the reservation ends, is cancelled, or the item is given.':
    'ეს ჩატი დროებითია. შეტყობინებები წაიშლება, როცა ჯავშანი დასრულდება, გაუქმდება ან ნივთი გაიცემა.',
  'No messages yet': 'შეტყობინებები ჯერ არ არის',
  'Use this temporary chat to arrange pickup.':
    'გამოიყენეთ დროებითი ჩატი ნივთის გადაცემის შესათანხმებლად.',
  'This chat has ended': 'ჩატი დასრულებულია',
  'The reservation is no longer active, so all chat messages were deleted.':
    'ჯავშანი აღარ არის აქტიური, ამიტომ ჩატის ყველა შეტყობინება წაიშალა.',
  Message: 'შეტყობინება',
  'Write a message...': 'დაწერეთ შეტყობინება...',
  Send: 'გაგზავნა',
  'Message could not be sent.': 'შეტყობინება ვერ გაიგზავნა.',
  'New chat message': 'ახალი შეტყობინება ჩატში',
  'Open the temporary chat to read the message.':
    'შეტყობინების სანახავად გახსენით დროებითი ჩატი.',
  'Temporary reservation chat for arranging item pickup.':
    'დროებითი ჯავშნის ჩატი ნივთის გადაცემის შესათანხმებლად.',
  'Show password': 'პაროლის ჩვენება',
  'Hide password': 'პაროლის დამალვა',
  'Use 8 to 72 characters for your password.':
    'პაროლი უნდა შეიცავდეს 8-დან 72-მდე სიმბოლოს.',
  'Post deleted.': 'განცხადება წაიშალა.',
  'Report status updated.': 'რეპორტის სტატუსი განახლდა.',
});

Object.assign(translations, {
  'Clear filters': 'ფილტრების გასუფთავება',
  Apply: 'გამოყენება',
  'More cities': 'მეტი ქალაქი',
  'Meet in a public place. Never pay cash to strangers.':
    'შეხვდით საჯარო ადგილას. არასოდეს გადაუხადოთ ფული უცნობებს.',
  'Report submitted.': 'რეპორტი გაგზავნილია.',
  Verification: 'ვერიფიკაცია',
  'Phone verified': 'ტელეფონი დადასტურებულია',
  Basic: 'საბაზისო',
  'Completed giveaways': 'დასრულებული გაცემა',
  'Community member': 'საზოგადოების წევრი',
  'Pickup area': 'გატანის ადგილი',
  Listed: 'დამატებულია',
});

Object.assign(translations, {
  'No conversations yet': 'საუბრები ჯერ არ არის',
  'Accepted reservations with active chats will appear here.':
    'დადასტურებული ჯავშნების აქტიური ჩატები აქ გამოჩნდება.',
  'Requester chat': 'მომთხოვნის ჩატი',
  'Author chat': 'ავტორის ჩატი',
  'If a reserved item was already given, do not forget to mark it as given.':
    'თუ დაჯავშნილი ნივთი უკვე გადაეცა, არ დაგავიწყდეთ მისი გაცემულად მონიშვნა.',
  'Reserved item reminder': 'დაჯავშნილი ნივთის შეხსენება',
  'Review reserved posts': 'დაჯავშნილი პოსტების ნახვა',
  Dismiss: 'დახურვა',
  'Item reservations': 'ნივთების ჯავშნები',
  'See who reserved your items.': 'ნახეთ, ვინ დაჯავშნა თქვენი ნივთები.',
  'Loading reservations': 'ჯავშნები იტვირთება',
  'Checking who reserved your items.':
    'ვამოწმებთ, ვინ დაჯავშნა თქვენი ნივთები.',
  'Could not load reservations': 'ჯავშნების ჩატვირთვა ვერ მოხერხდა',
  'No item reservations yet': 'თქვენს ნივთებზე ჯავშნები ჯერ არ არის',
  'When someone reserves your item, it will appear here.':
    'როცა ვინმე თქვენს ნივთს დაჯავშნის, აქ გამოჩნდება.',
  Item: 'ნივთი',
  reservations: 'ჯავშნები',
  Oldest: 'ძველი',
  'Most reservations': 'ყველაზე მეტი ჯავშანი',
  'Choose how to reserve': 'აირჩიეთ ჯავშნის ტიპი',
  'Pick the free request or test instant reservation. Instant reservation is a demo for admins only.':
    'აირჩიეთ უფასო მოთხოვნა ან სატესტო მყისიერი ჯავშანი. მყისიერი ჯავშანი მხოლოდ ადმინებისთვისაა.',
  Free: 'უფასო',
  'Request for free': 'უფასოდ მოთხოვნა',
  'Send a normal reservation request. The owner reviews it and accepts or rejects it.':
    'გაგზავნით ჩვეულებრივ მოთხოვნას. მფლობელი ნახავს და მიიღებს ან უარყოფს.',
  Instant: 'მყისიერი',
  'Reserve instantly': 'მყისიერად დაჯავშნა',
  'Skip owner approval in this demo. The item becomes reserved immediately, but the owner can still cancel.':
    'სატესტო რეჟიმში მფლობელის დადასტურება არ არის საჭირო. ნივთი მაშინვე დაიჯავშნება, მაგრამ მფლობელს გაუქმება მაინც შეუძლია.',
  'Admin demo only': 'მხოლოდ ადმინის დემო',
  'Reserve for 2.99 GEL': '2.99 GEL-ად დაჯავშნა',
  'Choose reservation': 'ჯავშნის არჩევა',
  'Cancel reservation and accept penalty': 'ჯავშნის გაუქმება და ჯარიმის მიღება',
  'Penalty warning': 'ჯარიმის გაფრთხილება',
  'If you cancel now, your account will be blocked from reserving and creating posts for 5 hours.':
    'თუ ახლა გააუქმებთ, თქვენი ანგარიში 5 საათით ვეღარ დაჯავშნის და ვეღარ დაამატებს ნივთებს.',
  'Cancel your reservation? You will not be able to reserve or post items for 5 hours.':
    'ჯავშნის გაუქმების შემდეგ 5 საათით ვერ დაჯავშნით და ვერ დაამატებთ ნივთებს.',
  'Cancel this accepted reservation? The requester will be notified and the item will become available again.':
    'გააუქმებთ მიღებულ ჯავშანს? მომხმარებელი შეტყობინებას მიიღებს და ნივთი ისევ ხელმისაწვდომი გახდება.',
  'Instant reservation RPC is not available to this Supabase API role yet. Grant execute to public, reload the schema cache, and try again.':
    'მყისიერი ჯავშნის RPC ამ Supabase API როლისთვის ჯერ არ ჩანს. მიეცით execute უფლება public როლს, განაახლეთ schema cache და სცადეთ თავიდან.',
  'Instant reservation RPC permission is still blocked. Grant execute to public, reload the schema cache, and try again.':
    'მყისიერი ჯავშნის RPC-ის უფლება ჯერ კიდევ დაბლოკილია. მიეცით execute უფლება public როლს, განაახლეთ schema cache და სცადეთ თავიდან.',
  'Instant reservation is available to admins only during demo testing.':
    'მყისიერი ჯავშანი სატესტო რეჟიმში მხოლოდ ადმინებისთვისაა.',
  'Owners cannot reserve their own posts.':
    'მფლობელი საკუთარ განცხადებას ვერ დაჯავშნის.',
  'This item is not available.': 'ეს ნივთი ხელმისაწვდომი აღარ არის.',
  'This item is already reserved.': 'ეს ნივთი უკვე დაჯავშნილია.',
  'You already requested this item.': 'ამ ნივთზე მოთხოვნა უკვე გაგზავნილია.',
  'You cannot reserve or post items yet because you recently cancelled a reservation.':
    'ჯერ ვერ დაჯავშნით და ვერ დაამატებთ ნივთებს, რადგან ცოტა ხნის წინ ჯავშანი გააუქმეთ.',
  'Posts are always free. Add clear photos and pickup details so people know exactly what they are requesting.':
    'განცხადებები ყოველთვის უფასოა. დაამატეთ მკაფიო ფოტოები და გატანის დეტალები, რომ მომხმარებელმა ზუსტად იცოდეს რას ითხოვს.',
  Pickup: 'გატანა',
  Photo: 'ფოტო',
  'Post summary': 'განცხადების შეჯამება',
  'Review the basics before publishing.':
    'გამოქვეყნებამდე გადაამოწმეთ ძირითადი ინფორმაცია.',
  Progress: 'პროგრესი',
  Publish: 'გამოქვეყნება',
  'Creating...': 'იქმნება...',
});

Object.assign(ruTranslations, {
  Boosted: 'VIP-объявление',
  'Boosted only': 'Только продвигаемые',
  'Boosted posts only': 'Только продвигаемые объявления',
  'Boost post': 'Продвинуть объявление',
  'Extend boost': 'Продлить продвижение',
  'Boost expires': 'Продвижение закончится',
  'Activate demo boost': 'Активировать демо-продвижение',
  'Activating boost...': 'Продвижение активируется...',
  'Boosted posts appear before regular posts until the boost expires.':
    'Продвигаемые объявления показываются перед обычными до окончания срока.',
  'Demo only — no payment will be charged.':
    'Только демо — оплата не будет списана.',
  '24 hours': '24 часа',
  '3 days': '3 дня',
  '7 days': '7 дней',
  'Could not boost post.': 'Не удалось продвинуть объявление.',
  'Demo payment completed': 'Демо-оплата завершена',
  'Your post is now at the top of the feed.':
    'Ваше объявление теперь находится в начале ленты.',
  'Top placement active until': 'Размещение в топе активно до',
  'Your post is in the top section': 'Объявление находится в топе',
  'Active until': 'Активно до',
  'VIP active': 'VIP активно',
  'VIP placement activated': 'VIP-размещение активировано',
  'Your post is now shown as a VIP listing.':
    'Ваше объявление теперь показывается как VIP.',
  'VIP time left': 'До окончания VIP',
  'VIP placement expired': 'Срок VIP истёк',
  d: 'д',
  Chat: 'Чат',
  'Chat with': 'Чат с',
  'Chat with owner': 'Чат с владельцем',
  'Back to item': 'Вернуться к вещи',
  'Loading chat': 'Чат загружается',
  'Your temporary conversation is loading.': 'Временный разговор загружается.',
  'Chat unavailable': 'Чат недоступен',
  'This chat could not be opened.': 'Не удалось открыть чат.',
  'Chat is not ready yet. Please try again in a moment.':
    'Чат еще не готов. Попробуйте через несколько секунд.',
  'This chat is temporary. Messages are deleted when the reservation ends, is cancelled, or the item is given.':
    'Этот чат временный. Сообщения удаляются после завершения или отмены брони либо передачи вещи.',
  'No messages yet': 'Сообщений пока нет',
  'Use this temporary chat to arrange pickup.':
    'Используйте временный чат, чтобы договориться о передаче.',
  'This chat has ended': 'Чат завершён',
  'The reservation is no longer active, so all chat messages were deleted.':
    'Бронь больше не активна, поэтому все сообщения чата были удалены.',
  Message: 'Сообщение',
  'Write a message...': 'Напишите сообщение...',
  Send: 'Отправить',
  'Message could not be sent.': 'Не удалось отправить сообщение.',
  'New chat message': 'Новое сообщение в чате',
  'Open the temporary chat to read the message.':
    'Откройте временный чат, чтобы прочитать сообщение.',
  'Temporary reservation chat for arranging item pickup.':
    'Временный чат бронирования для согласования передачи вещи.',
  'Show password': 'Показать пароль',
  'Hide password': 'Скрыть пароль',
  'Use 8 to 72 characters for your password.':
    'Используйте от 8 до 72 символов для пароля.',
  'Post deleted.': 'Объявление удалено.',
  'Report status updated.': 'Статус жалобы обновлён.',
});

Object.assign(ruTranslations, {
  'Clear filters': 'Очистить фильтры',
  Apply: 'Применить',
  'More cities': 'Другие города',
  'Meet in a public place. Never pay cash to strangers.':
    'Встречайтесь в общественном месте. Никогда не платите незнакомцам.',
  'Report submitted.': 'Жалоба отправлена.',
  Verification: 'Проверка',
  'Phone verified': 'Телефон подтверждён',
  Basic: 'Базовый',
  'Completed giveaways': 'Завершённые передачи',
  'Community member': 'Участник сообщества',
  'Pickup area': 'Место передачи',
  Listed: 'Добавлено',
  'No conversations yet': 'Разговоров пока нет',
  'Accepted reservations with active chats will appear here.':
    'Активные чаты по подтверждённым броням появятся здесь.',
  'Requester chat': 'Чат с получателем',
  'Author chat': 'Чат с автором',
  'If a reserved item was already given, do not forget to mark it as given.':
    'Если забронированная вещь уже передана, не забудьте отметить её как отданную.',
  'Reserved item reminder': 'Напоминание о брони',
  'Review reserved posts': 'Посмотреть забронированные посты',
  Dismiss: 'Закрыть',
  'Item reservations': 'Брони моих вещей',
  'See who reserved your items.': 'Посмотрите, кто забронировал ваши вещи.',
  'Loading reservations': 'Загрузка броней',
  'Checking who reserved your items.': 'Проверяем, кто забронировал ваши вещи.',
  'Could not load reservations': 'Не удалось загрузить брони',
  'No item reservations yet': 'Броней ваших вещей пока нет',
  'When someone reserves your item, it will appear here.':
    'Когда кто-то забронирует вашу вещь, она появится здесь.',
  Item: 'Вещь',
  reservations: 'брони',
  Oldest: 'Сначала старые',
  'Most reservations': 'Больше броней',
  'Choose how to reserve': 'Выберите способ бронирования',
  'Pick the free request or test instant reservation. Instant reservation is a demo for admins only.':
    'Выберите бесплатный запрос или тестовое мгновенное бронирование. Мгновенное бронирование сейчас доступно только администраторам.',
  Free: 'Бесплатно',
  'Request for free': 'Запросить бесплатно',
  'Send a normal reservation request. The owner reviews it and accepts or rejects it.':
    'Отправьте обычный запрос. Владелец рассмотрит его и примет или отклонит.',
  Instant: 'Мгновенно',
  'Reserve instantly': 'Забронировать сразу',
  'Skip owner approval in this demo. The item becomes reserved immediately, but the owner can still cancel.':
    'В демо-режиме подтверждение владельца пропускается. Вещь сразу резервируется, но владелец всё равно может отменить.',
  'Admin demo only': 'Демо только для админов',
  'Reserve for 2.99 GEL': 'Забронировать за 2.99 GEL',
  'Choose reservation': 'Выбрать бронь',
  'Cancel reservation and accept penalty': 'Отменить бронь и принять штраф',
  'Penalty warning': 'Предупреждение о штрафе',
  'If you cancel now, your account will be blocked from reserving and creating posts for 5 hours.':
    'Если отменить сейчас, аккаунт будет заблокирован для бронирования и публикации вещей на 5 часов.',
  'Cancel your reservation? You will not be able to reserve or post items for 5 hours.':
    'Отменить бронь? Вы не сможете бронировать или добавлять вещи в течение 5 часов.',
  'Cancel this accepted reservation? The requester will be notified and the item will become available again.':
    'Отменить принятую бронь? Пользователь получит уведомление, а вещь снова станет доступной.',
  'Instant reservation RPC is not available to this Supabase API role yet. Grant execute to public, reload the schema cache, and try again.':
    'RPC мгновенного бронирования пока недоступен этой роли Supabase API. Выдайте execute для public, обновите schema cache и попробуйте снова.',
  'Instant reservation RPC permission is still blocked. Grant execute to public, reload the schema cache, and try again.':
    'Право RPC мгновенного бронирования все еще заблокировано. Выдайте execute для public, обновите schema cache и попробуйте снова.',
  'Instant reservation is available to admins only during demo testing.':
    'Мгновенное бронирование в демо-режиме доступно только администраторам.',
  'Owners cannot reserve their own posts.':
    'Владелец не может бронировать свое объявление.',
  'This item is not available.': 'Эта вещь больше недоступна.',
  'This item is already reserved.': 'Эта вещь уже забронирована.',
  'You already requested this item.': 'Вы уже отправили запрос на эту вещь.',
  'You cannot reserve or post items yet because you recently cancelled a reservation.':
    'Вы пока не можете бронировать или добавлять вещи, потому что недавно отменили бронь.',
  'Posts are always free. Add clear photos and pickup details so people know exactly what they are requesting.':
    'Объявления всегда бесплатные. Добавьте понятные фото и детали передачи, чтобы пользователи точно понимали, что запрашивают.',
  Pickup: 'Передача',
  Photo: 'Фото',
  'Post summary': 'Сводка объявления',
  'Review the basics before publishing.':
    'Проверьте основную информацию перед публикацией.',
  Progress: 'Прогресс',
  Publish: 'Опубликовать',
  'Creating...': 'Создание...',
});

Object.assign(translations, {
  'Phone number required': 'ტელეფონის ნომერი საჭიროა',
  'Add phone number': 'ტელეფონის დამატება',
  'Add a Georgian mobile number in profile settings before creating posts or reserving items.':
    'განცხადების დამატებამდე ან ნივთის დაჯავშნამდე პროფილის პარამეტრებში დაამატეთ ქართული მობილური ნომერი.',
  'You need to add your mobile phone number before this action.':
    'ამ მოქმედებამდე უნდა დაამატოთ მობილური ტელეფონის ნომერი.',
});

Object.assign(ruTranslations, {
  'Phone number required': 'Требуется номер телефона',
  'Add phone number': 'Добавить телефон',
  'Add a Georgian mobile number in profile settings before creating posts or reserving items.':
    'Перед созданием объявлений или бронированием вещей добавьте грузинский мобильный номер в настройках профиля.',
  'You need to add your mobile phone number before this action.':
    'Перед этим действием нужно добавить номер мобильного телефона.',
});

Object.assign(translations, {
  Subcategory: 'ქვეკატეგორია',
  'All subcategories': 'ყველა ქვეკატეგორია',
  'All clothing': 'ყველა ტანსაცმელი',
  'All home': 'ყველა სახლის ნივთი',
  'All construction': 'ყველა სამშენებლო მასალა',
  'All vehicle items': 'ყველა ტრანსპორტის ნივთი',
  More: 'მეტი',
  Sort: 'დალაგება',
  Recommended: 'რეკომენდებული',
  Newest: 'უახლესი',
  Availability: 'ხელმისაწვდომობა',
  'All available': 'ყველა ხელმისაწვდომი',
  'VIP only': 'მხოლოდ VIP',
  'Choose a category from the list.': 'აირჩიეთ კატეგორია სიიდან.',
  Clothing: 'ტანსაცმელი',
  HomeCategory: 'სახლი',
  Electronics: 'ელექტრონიკა',
  Books: 'წიგნები',
  Children: 'ბავშვები',
  Sports: 'სპორტი',
  'Construction materials': 'სამშენებლო მასალა',
  'Vehicles and parts': 'ტრანსპორტი და ნაწილები',
  'Beauty and health': 'სილამაზე და ჯანმრთელობა',
  Pets: 'ცხოველები',
  'Office and business': 'ოფისი და ბიზნესი',
  Other: 'სხვა',
  'General clothing': 'ზოგადი ტანსაცმელი',
  'Women clothing': 'ქალის ტანსაცმელი',
  'Men clothing': 'მამაკაცის ტანსაცმელი',
  Shoes: 'ფეხსაცმელი',
  Bags: 'ჩანთები',
  Accessories: 'აქსესუარები',
  'Baby clothing': 'ბავშვის ტანსაცმელი',
  'General home items': 'ზოგადი სახლის ნივთები',
  Furniture: 'ავეჯი',
  'Home appliances': 'საყოფაცხოვრებო ტექნიკა',
  Kitchenware: 'სამზარეულოს ნივთები',
  'Home decor': 'დეკორი',
  'Bedding and textiles': 'თეთრეული და ტექსტილი',
  'Garden and outdoor': 'ბაღი და ეზო',
  'General electronics': 'ზოგადი ელექტრონიკა',
  'Phones and tablets': 'ტელეფონები და ტაბლეტები',
  'Computers and laptops': 'კომპიუტერები და ლეპტოპები',
  'TV and audio': 'ტელევიზორი და აუდიო',
  'Photo and video': 'ფოტო და ვიდეო',
  Gaming: 'გეიმინგი',
  'Cables and chargers': 'კაბელები და დამტენები',
  'General books': 'ზოგადი წიგნები',
  'Fiction and literature': 'მხატვრული ლიტერატურა',
  'School books': 'სასკოლო წიგნები',
  'University books': 'საუნივერსიტეტო წიგნები',
  Stationery: 'საკანცელარიო ნივთები',
  'Art supplies': 'სახატავი ნივთები',
  'Music and movies': 'მუსიკა და ფილმები',
  'General children items': 'ზოგადი საბავშვო ნივთები',
  Toys: 'სათამაშოები',
  Strollers: 'ეტლები',
  'Car seats': 'ავტოსავარძლები',
  'Kids furniture': 'საბავშვო ავეჯი',
  'School supplies': 'სასკოლო ნივთები',
  'Baby care': 'ბავშვის მოვლა',
  'General sports items': 'ზოგადი სპორტული ნივთები',
  'Bicycles and scooters': 'ველოსიპედები და სკუტერები',
  'Fitness equipment': 'ფიტნეს ინვენტარი',
  'Outdoor gear': 'გარე აქტივობის ნივთები',
  'Team sports': 'გუნდური სპორტი',
  Camping: 'კემპინგი',
  'Musical instruments': 'მუსიკალური ინსტრუმენტები',
  'General construction materials': 'ზოგადი სამშენებლო მასალა',
  Tools: 'ხელსაწყოები',
  'Paint and finishing': 'საღებავი და მოპირკეთება',
  Plumbing: 'სანტექნიკა',
  'Electrical supplies': 'ელექტრო მასალები',
  'Tiles and flooring': 'ფილები და იატაკი',
  'Doors and windows': 'კარები და ფანჯრები',
  'Wood and metal': 'ხე და ლითონი',
  'Hardware and fasteners': 'სამაგრები და ფურნიტურა',
  'General vehicle items': 'ზოგადი ტრანსპორტის ნივთები',
  'Car parts': 'ავტონაწილები',
  'Tires and wheels': 'საბურავები და დისკები',
  'Motorcycle parts': 'მოტოციკლის ნაწილები',
  'Bicycle parts': 'ველოსიპედის ნაწილები',
  'Tools and accessories': 'ხელსაწყოები და აქსესუარები',
  'General beauty and health': 'ზოგადი სილამაზე და ჯანმრთელობა',
  'Beauty products': 'სილამაზის პროდუქტები',
  'Personal care': 'პირადი მოვლა',
  'Medical supplies': 'სამედიცინო ნივთები',
  'Mobility aids': 'გადაადგილების დამხმარე საშუალებები',
  'General pet items': 'ზოგადი ცხოველების ნივთები',
  'Pet food': 'ცხოველების საკვები',
  'Pet beds and houses': 'ცხოველების საწოლები და სახლები',
  'Pet toys': 'ცხოველების სათამაშოები',
  'Aquarium supplies': 'აკვარიუმის ნივთები',
  'General office items': 'ზოგადი საოფისე ნივთები',
  'Office furniture': 'საოფისე ავეჯი',
  'Office equipment': 'საოფისე ტექნიკა',
  'Packaging materials': 'შეფუთვის მასალები',
  'Shop and cafe equipment': 'მაღაზიის და კაფეს ინვენტარი',
});

Object.assign(translations, {
  Chats: 'ჩატები',
  'Boost after publishing': 'გამოქვეყნების შემდეგ აბუსთე',
  'VIP priority': 'VIP პრიორიტეტი',
  'Publish, then boost your item to the top of the feed.':
    'გამოაქვეყნე და შემდეგ აწიე ნივთი სიის თავში.',
  'Choose listing plan': 'აირჩიეთ განთავსების გეგმა',
  'Pick how your item should appear before writing the post.':
    'პოსტის შევსებამდე აირჩიეთ, როგორ გამოჩნდეს თქვენი ნივთი.',
  'Starter VIP': 'საწყისი VIP',
  'Popular VIP': 'პოპულარული VIP',
  'Maximum VIP': 'მაქსიმალური VIP',
  '24 hours near the top of the feed.': '24 საათი სიის ზედა ნაწილთან.',
  '3 days of priority visibility.': '3 დღე პრიორიტეტული გამოჩენა.',
  '7 days of maximum visibility.': '7 დღე მაქსიმალური ხილვადობა.',
  'Continue with VIP': 'VIP-ით გაგრძელება',
  'Checking VIP availability...': 'VIP ხელმისაწვდომობა მოწმდება...',
  'Free plan': 'უფასო გეგმა',
  'Standard listing': 'სტანდარტული განცხადება',
  'Post for free now. You can still boost this item later from the post page.':
    'განათავსეთ უფასოდ ახლა. ამ ნივთის აბუსთვა მოგვიანებითაც შეგიძლიათ პოსტის გვერდიდან.',
  'Continue free': 'უფასოდ გაგრძელება',
  'Selected plan': 'არჩეული გეგმა',
  'VIP boost opens after publishing.':
    'VIP აბუსთვის ფანჯარა გამოქვეყნების შემდეგ გაიხსნება.',
  'Standard free listing.': 'სტანდარტული უფასო განცხადება.',
  Change: 'შეცვლა',
  'Demo only - no payment will be charged.':
    'მხოლოდ დემო - თანხა არ ჩამოგეჭრებათ.',
});

Object.assign(ruTranslations, {
  Chats: 'Чаты',
  'Boost after publishing': 'Продвиньте после публикации',
  'VIP priority': 'VIP-приоритет',
  'Publish, then boost your item to the top of the feed.':
    'Опубликуйте, затем поднимите вещь в начало ленты.',
  'Choose listing plan': 'Выберите план размещения',
  'Pick how your item should appear before writing the post.':
    'Выберите, как вещь будет показываться, перед заполнением объявления.',
  'Starter VIP': 'Стартовый VIP',
  'Popular VIP': 'Популярный VIP',
  'Maximum VIP': 'Максимальный VIP',
  '24 hours near the top of the feed.': '24 часа ближе к началу ленты.',
  '3 days of priority visibility.': '3 дня приоритетной видимости.',
  '7 days of maximum visibility.': '7 дней максимальной видимости.',
  'Continue with VIP': 'Продолжить с VIP',
  'Checking VIP availability...': 'Проверка доступности VIP...',
  'Free plan': 'Бесплатный план',
  'Standard listing': 'Стандартное объявление',
  'Post for free now. You can still boost this item later from the post page.':
    'Опубликуйте бесплатно сейчас. Позже вещь можно продвинуть со страницы объявления.',
  'Continue free': 'Продолжить бесплатно',
  'Selected plan': 'Выбранный план',
  'VIP boost opens after publishing.':
    'Окно VIP-продвижения откроется после публикации.',
  'Standard free listing.': 'Стандартное бесплатное объявление.',
  Change: 'Изменить',
  'Demo only - no payment will be charged.':
    'Только демо - оплата не будет списана.',
});

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
