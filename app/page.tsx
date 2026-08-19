import BirthdayCake from "@/components/birthday/BirthdayCake";
import BirthdayHero from "@/components/birthday/BirthdayHero";
import BirthdayTimeline from "@/components/birthday/BirthdayTimeline";
import BirthdayWishes from "@/components/birthday/BirthdayWishes";
import FinalMessage from "@/components/birthday/FinalMessage";
import Footer from "@/components/birthday/Footer";
import MusicPlayer from "@/components/birthday/MusicPlayer";
import Navbar from "@/components/birthday/Navbar";
import PhotoGallery from "@/components/birthday/PhotoGallery";
import SurpriseGift from "@/components/birthday/SurpriseGift";
import VideoMemories from "@/components/birthday/VideoMemories";
import { birthdayData } from "@/data/birthday";
import { photoMonths, videoMonths } from "@/data/media";

export default function Home() {
  const {
    name,
    age,
    birthday,
    birthdayLabel,
    heroMessage,
    finalMessage,
    surpriseMessage,
    musicSrc,
    wishes,
    milestones,
    navLinks,
  } = birthdayData;

  return (
    <>
      <Navbar name={name} links={navLinks} />

      <main>
        <BirthdayHero
          name={name}
          age={age}
          birthday={birthday}
          birthdayLabel={birthdayLabel}
          message={heroMessage}
          ctaTarget="#wishes"
        />
        <BirthdayWishes name={name} initialWishes={wishes} />
        <PhotoGallery months={photoMonths} />
        <VideoMemories months={videoMonths} />
        <BirthdayTimeline milestones={milestones} />
        <BirthdayCake name={name} />
        <SurpriseGift message={surpriseMessage} />
        <FinalMessage name={name} message={finalMessage} />
      </main>

      <MusicPlayer src={musicSrc} />
      <Footer name={name} year={new Date().getFullYear()} />
    </>
  );
}
