"use client";

import React from "react";
import { useTranslation } from "@/context/TranslationContext";

interface UserModalComponentProps {
  modal_id: string;
  title: string;
  text: string;
  triggerAccept?: null | ((a: any) => void);
  triggerValue?: any | null;
  triggerString?: string | null;
}

import VerbaButton from "./VerbaButton";

const UserModalComponent: React.FC<UserModalComponentProps> = ({
  title,
  modal_id,
  text,
  triggerAccept,
  triggerString,
  triggerValue,
}) => {
  const { t } = useTranslation();

  return (
    <dialog id={modal_id} className="modal">
      <div className="modal-box flex flex-col gap-2">
        <h3 className="font-bold text-lg">{t(title, title)}</h3>
        <p className="whitespace-pre-wrap">{t(text, text)}</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            {triggerAccept && triggerString && (
              <VerbaButton
                type="submit"
                title={t(triggerString, triggerString)}
                onClick={() => {
                  triggerAccept(triggerValue);
                }}
              />
            )}
            <VerbaButton
              type="submit"
              title={t("common.cancel", "Cancel")}
              selected_color="bg-warning-verba"
              selected={true}
            />
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default UserModalComponent;
