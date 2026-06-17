import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteImageUploader } from "@/components/admin/SiteImageUploader";

// Small wrapper around SiteImageUploader that loads the current value from
// `site_settings` by key. Used by the admin Workshops settings panel.
export const WorkshopCardImageField = ({
  settingKey,
  label,
}: {
  settingKey: string;
  label: string;
}) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", settingKey)
      .maybeSingle()
      .then(({ data }) => {
        setUrl((data?.value as string) || "");
      });
  }, [settingKey]);

  return (
    <SiteImageUploader
      settingKey={settingKey}
      label={label}
      currentUrl={url}
      onUploaded={setUrl}
    />
  );
};
