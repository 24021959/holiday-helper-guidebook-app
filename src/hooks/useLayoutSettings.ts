
import { useLayoutForm } from './layout/useLayoutForm';
import { useLayoutDataLoad } from './layout/useLayoutDataLoad';
import { useLayoutSave } from './layout/useLayoutSave';
import { useColorPreview } from './layout/useColorPreview';

export type { LayoutSettingsForm } from './layout/useLayoutForm';

export const useLayoutSettings = () => {
  const form = useLayoutForm();
  const { formLoaded, loadError } = useLayoutDataLoad(form);
  const { isLoading, isSuccess, saveAttempt, onSubmit } = useLayoutSave();
  const colorPreview = useColorPreview(form.watch);

  return {
    form,
    formLoaded,
    loadError,
    isLoading,
    isSuccess,
    saveAttempt,
    onSubmit,
    ...colorPreview
  };
};

