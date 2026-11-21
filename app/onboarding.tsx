import { useRouter } from 'expo-router';
import { OnboardingView } from '@/onboarding/OnboardingView';
import { goBackOrHome, HOME_HREF } from '@/core/navigation';
import { useSettingsStore } from '@/stores/settingsStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  const onboardingReview = useSettingsStore((s) => s.onboardingReview);
  const dismissOnboardingReview = useSettingsStore((s) => s.dismissOnboardingReview);
  const review = onboardingDone || onboardingReview;

  const onDone = () => {
    if (review) {
      if (onboardingReview) dismissOnboardingReview();
      goBackOrHome(router, HOME_HREF);
    }
  };

  return <OnboardingView review={review} onDone={onDone} />;
}
