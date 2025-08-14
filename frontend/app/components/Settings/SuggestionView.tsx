"use client";

import React, { useState, useEffect } from "react";
import { Credentials, Suggestion } from "@/app/types";
import { IoTrash, IoDocumentSharp, IoReload, IoCopy } from "react-icons/io5";
import { FaWrench } from "react-icons/fa";
import { fetchAllSuggestions, deleteSuggestion } from "@/app/api";
import UserModalComponent from "../Navigation/UserModal";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import { formatDistanceToNow, parseISO } from "date-fns";

import VerbaButton from "../Navigation/VerbaButton";
import { useTranslation } from "@/context/TranslationContext";

interface SuggestionViewProps {
  credentials: Credentials;
  addStatusMessage: (
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  ) => void;
}

const SuggestionView: React.FC<SuggestionViewProps> = ({
  credentials,
  addStatusMessage,
}) => {
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const { t } = useTranslation();

  const handleSuggestionFetch = async () => {
    const suggestions = await fetchAllSuggestions(page, pageSize, credentials);
    if (suggestions) {
      setSuggestions(suggestions.suggestions);
      setTotalCount(suggestions.total_count);
    }
  };
  useEffect(() => {
    handleSuggestionFetch();
  }, []);

  useEffect(() => {
    handleSuggestionFetch();
  }, [page]);

  const nextPage = () => {
    if (page * pageSize <= totalCount) {
      setPage((prev) => prev + 1);
    } else {
      setPage(1);
    }
  };

  const previousPage = () => {
    if (page == 1) {
      setPage(1);
    } else {
      setPage((prev) => prev - 1);
    }
  };

  const openModal = (modal_id: string) => {
    const modal = document.getElementById(modal_id);
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    try {
      const date = parseISO(timestamp);
      const phrase = formatDistanceToNow(date, { addSuffix: true });
      return t(phrase, phrase);
    } catch (error) {
      console.error("Error parsing timestamp:", error);
      const fallback = "Invalid date";
      return t(fallback, fallback);
    }
  };

  const handleRefresh = () => {
    handleSuggestionFetch();
  };

  const handleDelete = async (uuid: string) => {
    await deleteSuggestion(uuid, credentials);
    await handleSuggestionFetch();
    addStatusMessage(
      t("settings.status.suggestion_deleted", "Suggestion deleted"),
      "SUCCESS"
    );
  };

  const handleCopy = (query: string) => {
    navigator.clipboard.writeText(query).then(() => {
      // You can add a toast notification here if you want
      console.log("Copied to clipboard");
    });
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold">
          {t("settings.manage_suggestions_n", "Manage Suggestions ({{n}})", {
            n: totalCount,
          })}
        </p>
        <VerbaButton
          title={t("common.refresh", "Refresh")}
          className="max-w-min"
          onClick={handleRefresh}
          Icon={IoReload}
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="gap-4 flex flex-col p-4 text-text-verba">
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion) => (
              <div
                key={"Suggestion" + suggestion.uuid}
                className="flex items-center justify-between gap-2 p-4 border-2 bg-bg-alt-verba rounded-xl"
              >
                <div className="flex flex-col items-start justify-start gap-2 w-2/3">
                  <p className="font-bold flex text-xs text-start text-text-alt-verba">
                    {getTimeAgo(suggestion.timestamp)}
                  </p>
                  <p
                    className="text-sm text-text-verba truncate max-w-full"
                    title={suggestion.query}
                  >
                    {t(suggestion.query, suggestion.query)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <VerbaButton
                    onClick={() => handleCopy(suggestion.query)}
                    Icon={IoCopy}
                  />
                  <VerbaButton
                    onClick={() =>
                      openModal("remove_suggestion" + suggestion.uuid)
                    }
                    Icon={IoTrash}
                  />
                </div>
                <UserModalComponent
                  modal_id={"remove_suggestion" + suggestion.uuid}
                  title={t(
                    "settings.modal.remove_suggestion.title",
                    "Remove Suggestion"
                  )}
                  text={t(
                    "settings.modal.remove_suggestion.text",
                    "Do you want to remove this suggestion?"
                  )}
                  triggerString={t("common.delete", "Delete")}
                  triggerValue={suggestion.uuid}
                  triggerAccept={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="flex justify-center items-center gap-2 p-3 bg-bg-alt-verba">
          <VerbaButton
            title={t("settings.previous_page", "Previous Page")}
            onClick={previousPage}
            className="btn-sm min-w-min max-w-[200px]"
            text_class_name="text-xs"
            Icon={FaArrowAltCircleLeft}
          />
          <p className="text-xs flex text-text-verba">
            {t("settings.page_n", "Page {{n}}", { n: page })}
          </p>
          <VerbaButton
            title={t("settings.next_page", "Next Page")}
            onClick={nextPage}
            className="btn-sm min-w-min max-w-[200px]"
            text_class_name="text-xs"
            Icon={FaArrowAltCircleRight}
          />
        </div>
      )}
    </div>
  );
};

export default SuggestionView;
