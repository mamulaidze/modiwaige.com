import { Link } from 'react-router-dom';

import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useI18n, type Language } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';

type LegalPageKey = 'privacy' | 'terms' | 'safety' | 'contact';

type LegalSection = {
  heading: string;
  body: string[];
};

type LegalPageContent = {
  title: string;
  intro: string;
  reviewNotice: string;
  sections: LegalSection[];
};

const content: Record<LegalPageKey, Record<Language, LegalPageContent>> = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      intro:
        'This page explains what information Gaachuqe may collect and how it is used to run a free local giving marketplace.',
      reviewNotice:
        'Legal review needed: this is a plain-language draft and should be reviewed before production launch.',
      sections: [
        {
          heading: 'Information we collect',
          body: [
            'Account details such as your name, email address, phone number, and profile location.',
            'Post details you provide, including descriptions, pickup city, category, and photos you upload.',
            'Reservation, report, moderation, and basic technical information needed to protect the service.',
          ],
        },
        {
          heading: 'How information is used',
          body: [
            'To show posts, help users arrange pickup, manage reservations, review reports, and prevent abuse.',
            'Phone or contact information may be visible to another user when it is needed to arrange pickup.',
            'Uploaded photos are stored so they can be shown with your posts.',
          ],
        },
        {
          heading: 'Account deletion and contact',
          body: [
            'You can request account deletion from your account settings when available.',
            'For privacy questions or deletion help, contact the app owner using the Contact page.',
          ],
        },
      ],
    },
    ge: {
      title: 'კონფიდენციალურობის პოლიტიკა',
      intro:
        'ეს გვერდი განმარტავს, რა ინფორმაციას შეიძლება აგროვებდეს Gaachuqe უფასო გაცვლის პლატფორმის მუშაობისთვის.',
      reviewNotice:
        'საჭიროა იურიდიული შემოწმება: ეს არის მარტივი სამუშაო ვერსია და საჯარო გაშვებამდე უნდა გადაიხედოს.',
      sections: [
        {
          heading: 'რა ინფორმაციას ვაგროვებთ',
          body: [
            'ანგარიშის მონაცემებს, როგორიცაა სახელი, ელფოსტა, ტელეფონის ნომერი და პროფილის მდებარეობა.',
            'განცხადების ინფორმაციას, მათ შორის აღწერას, აღების ქალაქს, კატეგორიას და ატვირთულ ფოტოებს.',
            'ჯავშნების, რეპორტების, მოდერაციის და ტექნიკურ მონაცემებს, რომლებიც სერვისის უსაფრთხოებისთვის საჭიროა.',
          ],
        },
        {
          heading: 'როგორ გამოიყენება ინფორმაცია',
          body: [
            'განცხადებების ჩვენებისთვის, აღების შეთანხმებისთვის, ჯავშნების მართვისთვის, რეპორტების განხილვისთვის და ბოროტად გამოყენების შესამცირებლად.',
            'ტელეფონი ან საკონტაქტო ინფორმაცია შეიძლება გამოჩნდეს სხვა მომხმარებლისთვის, როცა ეს აღების შეთანხმებისთვის საჭიროა.',
            'ატვირთული ფოტოები ინახება, რათა განცხადებებთან ერთად გამოჩნდეს.',
          ],
        },
        {
          heading: 'ანგარიშის წაშლა და კონტაქტი',
          body: [
            'ანგარიშის წაშლის მოთხოვნა შეგიძლიათ ანგარიშის პარამეტრებიდან, როცა ეს ფუნქცია ხელმისაწვდომია.',
            'კონფიდენციალურობის კითხვებისთვის ან წაშლაში დახმარებისთვის დაგვიკავშირდით Contact გვერდიდან.',
          ],
        },
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms of Use',
      intro:
        'These terms describe basic rules for using Gaachuqe. The app helps people give away unwanted items for free.',
      reviewNotice:
        'Legal review needed: this is not final legal advice or a complete contract.',
      sections: [
        {
          heading: 'Using the service',
          body: [
            'Use the app honestly and only post items you are allowed to give away.',
            'Posts, photos, phone numbers, and messages you share should be accurate and respectful.',
            'Gaachuqe may remove posts, restrict accounts, or review reports when rules appear to be broken.',
          ],
        },
        {
          heading: 'No sale or guarantee',
          body: [
            'Items on Gaachuqe should be offered for free.',
            'The app does not inspect items, guarantee condition, or promise that pickup will happen.',
            'Users are responsible for deciding whether an item and pickup arrangement are suitable.',
          ],
        },
        {
          heading: 'Account changes',
          body: [
            'You are responsible for keeping your account information current.',
            'You may request account deletion, but some limited records may be kept where needed for safety, moderation, or legal reasons.',
          ],
        },
      ],
    },
    ge: {
      title: 'გამოყენების პირობები',
      intro:
        'ეს პირობები აღწერს Gaachuqe-ის გამოყენების ძირითად წესებს. აპი ეხმარება ადამიანებს არასაჭირო ნივთების უფასოდ გაჩუქებაში.',
      reviewNotice:
        'საჭიროა იურიდიული შემოწმება: ეს არ არის საბოლოო იურიდიული რჩევა ან სრული ხელშეკრულება.',
      sections: [
        {
          heading: 'სერვისის გამოყენება',
          body: [
            'გამოიყენეთ აპი კეთილსინდისიერად და განათავსეთ მხოლოდ ის ნივთები, რომელთა გაჩუქების უფლებაც გაქვთ.',
            'განცხადებები, ფოტოები, ტელეფონის ნომრები და სხვა გაზიარებული ინფორმაცია უნდა იყოს ზუსტი და პატივისცემით დაწერილი.',
            'Gaachuqe-ს შეუძლია წაშალოს განცხადებები, შეზღუდოს ანგარიშები ან განიხილოს რეპორტები, როცა წესების დარღვევა ჩანს.',
          ],
        },
        {
          heading: 'გაყიდვის ან გარანტიის გარეშე',
          body: [
            'Gaachuqe-ზე ნივთები უნდა იყოს უფასოდ შეთავაზებული.',
            'აპი არ ამოწმებს ნივთებს, არ იძლევა მდგომარეობის გარანტიას და არ ჰპირდება, რომ აღება აუცილებლად შედგება.',
            'მომხმარებელი თავად წყვეტს, არის თუ არა ნივთი და შეხვედრის პირობები მისთვის მისაღები.',
          ],
        },
        {
          heading: 'ანგარიშის ცვლილებები',
          body: [
            'თქვენ პასუხისმგებელი ხართ ანგარიშის ინფორმაციის განახლებაზე.',
            'შეგიძლიათ მოითხოვოთ ანგარიშის წაშლა, თუმცა უსაფრთხოების, მოდერაციის ან სამართლებრივი მიზეზებით ზოგი შეზღუდული ჩანაწერი შეიძლება დარჩეს.',
          ],
        },
      ],
    },
  },
  safety: {
    en: {
      title: 'Safety and Community Rules',
      intro:
        'These rules help keep local giving simple, respectful, and safer for everyone.',
      reviewNotice:
        'Safety review needed: these rules are a starting point and may need updates as the community grows.',
      sections: [
        {
          heading: 'Safe pickup advice',
          body: [
            'Meet in a public place when possible, especially with someone you do not know.',
            'Tell someone where you are going, avoid sharing unnecessary personal information, and trust your judgment.',
            'Do not send money, deposits, codes, or sensitive documents to receive a free item.',
          ],
        },
        {
          heading: 'Prohibited content',
          body: [
            'Do not post illegal items, weapons, dangerous goods, recalled products, stolen property, adult content, or items that require special licensing.',
            'Do not harass, threaten, impersonate others, spam, or use the app to sell items.',
            'Photos must show the item and must not include private information unless you intend to share it.',
          ],
        },
        {
          heading: 'Reports and moderation',
          body: [
            'Use reports when a post or user appears unsafe, misleading, abusive, or against the rules.',
            'Moderators may review reports and remove content or restrict accounts when needed.',
          ],
        },
      ],
    },
    ge: {
      title: 'უსაფრთხოება და საზოგადოების წესები',
      intro:
        'ეს წესები გვეხმარება, რომ ადგილობრივი გაცემა იყოს მარტივი, პატივისცემაზე დაფუძნებული და უფრო უსაფრთხო.',
      reviewNotice:
        'საჭიროა უსაფრთხოების წესების შემოწმება: ეს საწყისი ვერსიაა და საზოგადოების ზრდასთან ერთად შეიძლება განახლდეს.',
      sections: [
        {
          heading: 'უსაფრთხო აღების რჩევები',
          body: [
            'შეძლებისდაგვარად შეხვდით საჯარო ადგილას, განსაკუთრებით უცნობ ადამიანთან.',
            'უთხარით ახლობელს სად მიდიხართ, არ გააზიაროთ ზედმეტი პირადი ინფორმაცია და ენდეთ საკუთარ შეფასებას.',
            'უფასო ნივთის მისაღებად არ გააგზავნოთ ფული, დეპოზიტი, კოდები ან სენსიტიური დოკუმენტები.',
          ],
        },
        {
          heading: 'აკრძალული კონტენტი',
          body: [
            'არ განათავსოთ უკანონო ნივთები, იარაღი, სახიფათო საქონელი, გამოწვეული პროდუქტები, მოპარული ნივთები, ზრდასრულთა კონტენტი ან ნივთები, რომლებსაც სპეციალური ლიცენზია სჭირდება.',
            'აკრძალულია შეურაცხყოფა, მუქარა, სხვისი სახელით მოქმედება, სპამი ან აპის გაყიდვებისთვის გამოყენება.',
            'ფოტოები უნდა აჩვენებდეს ნივთს და არ უნდა შეიცავდეს პირად ინფორმაციას, თუ მისი გაზიარება არ გსურთ.',
          ],
        },
        {
          heading: 'რეპორტები და მოდერაცია',
          body: [
            'გამოიყენეთ რეპორტი, როცა განცხადება ან მომხმარებელი სახიფათო, მცდარი, შეურაცხმყოფელი ან წესების საწინააღმდეგო ჩანს.',
            'მოდერატორებს შეუძლიათ რეპორტების განხილვა და საჭიროებისას კონტენტის წაშლა ან ანგარიშის შეზღუდვა.',
          ],
        },
      ],
    },
  },
  contact: {
    en: {
      title: 'Contact',
      intro:
        'Use this page for privacy questions, account deletion help, safety concerns, moderation questions, or general support.',
      reviewNotice:
        'Contact details placeholder: replace this with the production support email or contact process before launch.',
      sections: [
        {
          heading: 'How to reach us',
          body: [
            'Support email placeholder: support@example.com',
            'For urgent safety issues, contact local emergency services first. The app is not an emergency service.',
          ],
        },
        {
          heading: 'What to include',
          body: [
            'Include your account email, the post link if relevant, and a short description of the issue.',
            'Do not send passwords, payment card details, or government ID unless a verified support process asks for it.',
          ],
        },
      ],
    },
    ge: {
      title: 'კონტაქტი',
      intro:
        'ეს გვერდი გამოიყენეთ კონფიდენციალურობის კითხვებისთვის, ანგარიშის წაშლაში დახმარებისთვის, უსაფრთხოების საკითხებისთვის, მოდერაციის კითხვებისთვის ან ზოგადი მხარდაჭერისთვის.',
      reviewNotice:
        'საკონტაქტო მონაცემების ადგილი: გაშვებამდე ჩაანაცვლეთ რეალური მხარდაჭერის ელფოსტით ან კონტაქტის პროცესით.',
      sections: [
        {
          heading: 'როგორ დაგვიკავშირდეთ',
          body: [
            'მხარდაჭერის ელფოსტის ადგილი: support@example.com',
            'სასწრაფო უსაფრთხოების საკითხებისთვის პირველ რიგში დაუკავშირდით ადგილობრივ გადაუდებელ სამსახურს. აპი არ არის გადაუდებელი დახმარების სერვისი.',
          ],
        },
        {
          heading: 'რა ინფორმაცია მოგვწეროთ',
          body: [
            'მიუთითეთ ანგარიშის ელფოსტა, განცხადების ბმული თუ საჭიროა, და პრობლემის მოკლე აღწერა.',
            'არ გააგზავნოთ პაროლები, საბანკო ბარათის მონაცემები ან პირადობის დოკუმენტი, თუ ამას დადასტურებული მხარდაჭერის პროცესი არ ითხოვს.',
          ],
        },
      ],
    },
  },
};

export function PrivacyPolicyPage() {
  return <LegalPage pageKey="privacy" />;
}

export function TermsPage() {
  return <LegalPage pageKey="terms" />;
}

export function SafetyRulesPage() {
  return <LegalPage pageKey="safety" />;
}

export function ContactPage() {
  return <LegalPage pageKey="contact" />;
}

function LegalPage({ pageKey }: { pageKey: LegalPageKey }) {
  const { language, localizedPath, t } = useI18n();
  const page = content[pageKey][language];

  return (
    <PageContainer className="gap-6">
      <Seo title={page.title} description={page.intro} />
      <section className="space-y-4">
        <div className="glass-control text-primary w-fit rounded-full px-3 py-2 text-sm font-semibold">
          {t('Legal and trust')}
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {page.title}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-base leading-7">
            {page.intro}
          </p>
        </div>
        <p className="border-primary/30 bg-primary/5 text-primary rounded-2xl border px-4 py-3 text-sm leading-6">
          {page.reviewNotice}
        </p>
      </section>

      <section className="grid gap-4">
        {page.sections.map((section) => (
          <article
            className="premium-card rounded-3xl p-4 sm:p-5"
            key={section.heading}
          >
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
              {section.body.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to={localizedPath('/privacy')}>{t('Privacy')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={localizedPath('/terms')}>{t('Terms')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={localizedPath('/safety')}>{t('Safety')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={localizedPath('/contact')}>{t('Contact')}</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
