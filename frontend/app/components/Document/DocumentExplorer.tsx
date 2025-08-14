"use client";
import React, { useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import VectorView from "./VectorView";
import ChunkView from "./ChunkView";
import InfoComponent from "../Navigation/InfoComponent";

import DocumentMetaView from "./DocumentMetaView";

import { MdCancel } from "react-icons/md";
import { MdContentPaste } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import { TbVectorTriangle } from "react-icons/tb";
import ContentView from "./ContentView";
import { IoMdAddCircle } from "react-icons/io";
import { FaExternalLinkAlt } from "react-icons/fa";
import {
  VerbaDocument,
  DocumentPayload,
  Credentials,
  ChunkScore,
  Theme,
  DocumentFilter,
} from "@/app/types";

import VerbaButton from "../Navigation/VerbaButton";

import { fetchSelectedDocument } from "@/app/api";
import { useTranslation } from "@/context/TranslationContext";

interface DocumentExplorerProps {
  selectedDocument: string | null;
  setSelectedDocument: (c: string | null) => void;
  chunkScores?: ChunkScore[];
  credentials: Credentials;
  selectedTheme: Theme;
  production: "Local" | "Demo" | "Production";
  documentFilter: DocumentFilter[];
  setDocumentFilter: React.Dispatch<React.SetStateAction<DocumentFilter[]>>;
  addStatusMessage: (
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  ) => void;
}

const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  credentials,
  selectedDocument,
  setSelectedDocument,
  chunkScores,
  production,
  selectedTheme,
  documentFilter,
  setDocumentFilter,
  addStatusMessage,
}) => {
  const { t } = useTranslation();

  const [selectedSetting, setSelectedSetting] = useState<
    "Content" | "Chunks" | "Metadata" | "Config" | "Vector Space" | "Graph"
  >("Content");

  const [isFetching, setIsFetching] = useState(false);
  const [document, setDocument] = useState<VerbaDocument | null>(null);

  useEffect(() => {
    if (selectedDocument) {
      handleFetchSelectedDocument();
    } else {
      setDocument(null);
    }
  }, [selectedDocument]);

  const handleSourceClick = (url: string) => {
    // Open a new tab with the specified URL
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFetchSelectedDocument = async () => {
    try {
      setIsFetching(true);

      const data: DocumentPayload | null = await fetchSelectedDocument(
        selectedDocument,
        credentials
      );

      if (data) {
        if (data.error !== "") {
          console.error(data.error);
          setIsFetching(false);
          setDocument(null);
          setSelectedDocument(null);
        } else {
          setDocument(data.document);
          setIsFetching(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch document:", error);
      setIsFetching(false);
    }
  };

  if (!selectedDocument) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Search Header */}
      <div className="bg-bg-alt-verba rounded-2xl flex gap-2 p-3 items-center justify-end lg:justify-between h-min w-full">
        <div className="hidden lg:flex gap-2 justify-start ">
          <InfoComponent
            tooltip_text={t(
              "document.explorer.tooltip",
              "Inspect all information about your document, such as chunks, metadata, and more."
            )}
            display_text={
              document
                ? t(document.title, document.title)
                : t("common.loading", "Loading...")
            }
          />
        </div>
        <div className="flex gap-3 justify-end">
          <VerbaButton
            title={t("document.explorer.content", "Content")}
            Icon={MdContentPaste}
            onClick={() => setSelectedSetting("Content")}
            selected={selectedSetting === "Content"}
            selected_color="bg-secondary-verba"
          />

          <VerbaButton
            title={t("document.explorer.chunks", "Chunks")}
            Icon={MdContentCopy}
            onClick={() => setSelectedSetting("Chunks")}
            selected={selectedSetting === "Chunks"}
            selected_color="bg-secondary-verba"
          />

          <VerbaButton
            title={t("document.explorer.vector", "Vector")}
            Icon={TbVectorTriangle}
            onClick={() => setSelectedSetting("Vector Space")}
            selected={selectedSetting === "Vector Space"}
            selected_color="bg-secondary-verba"
          />

          <VerbaButton
            Icon={MdCancel}
            onClick={() => {
              setSelectedDocument(null);
            }}
          />
        </div>
      </div>

      {/* Document List */}
      <div className="bg-bg-alt-verba rounded-2xl flex flex-col p-6 h-full w-full overflow-y-auto overflow-x-hidden">
        {selectedSetting === "Content" && (
          <ContentView
            selectedTheme={selectedTheme}
            document={document}
            credentials={credentials}
            selectedDocument={selectedDocument}
            chunkScores={chunkScores}
          />
        )}

        {selectedSetting === "Chunks" && (
          <ChunkView
            selectedTheme={selectedTheme}
            credentials={credentials}
            selectedDocument={selectedDocument}
          />
        )}

        {selectedSetting === "Vector Space" && (
          <VectorView
            credentials={credentials}
            selectedDocument={selectedDocument}
            chunkScores={chunkScores}
            production={production}
          />
        )}

        {selectedSetting === "Metadata" && (
          <DocumentMetaView
            credentials={credentials}
            selectedDocument={selectedDocument}
          />
        )}
      </div>

      {/* Import Footer */}
      <div className="bg-bg-alt-verba rounded-2xl flex gap-2 p-3 items-center justify-between h-min w-full">
        <div className="flex gap-3">
          {documentFilter.some(
            (filter) => filter.uuid === selectedDocument
          ) && (
            <VerbaButton
              title={t("document.button.delete_from_chat", "Delete from Chat")}
              Icon={MdCancel}
              selected={true}
              selected_color="bg-warning-verba"
              onClick={() => {
                setDocumentFilter(
                  documentFilter.filter((f) => f.uuid !== selectedDocument)
                );
                addStatusMessage(
                  t(
                    "chat.status.removed_document_from_chat",
                    "Removed document from Chat"
                  ),
                  "INFO"
                );
              }}
            />
          )}
          {!documentFilter.some((filter) => filter.uuid === selectedDocument) &&
            document && (
              <VerbaButton
                title={t("document.button.add_to_chat", "Add to Chat")}
                Icon={IoMdAddCircle}
                onClick={() => {
                  setDocumentFilter([
                    ...documentFilter,
                    { uuid: selectedDocument, title: document.title },
                  ]);
                  addStatusMessage(
                    t(
                      "chat.status.added_document_to_chat",
                      "Added document to Chat"
                    ),
                    "SUCCESS"
                  );
                }}
              />
            )}
        </div>
        <div className="flex gap-3">
          {selectedDocument && document && document.source && (
            <VerbaButton
              title={t("document.button.go_to_source", "Go To Source")}
              Icon={FaExternalLinkAlt}
              onClick={() => {
                handleSourceClick(document.source);
              }}
            />
          )}
          <VerbaButton
            title={t("document.button.document_info", "Document Info")}
            Icon={FaInfoCircle}
            onClick={() => setSelectedSetting("Metadata")}
            selected={selectedSetting === "Metadata"}
            selected_color="bg-secondary-verba"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentExplorer;
