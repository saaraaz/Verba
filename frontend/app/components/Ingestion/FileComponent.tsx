"use client";

import React from "react";
import { FileData, FileMap, statusTextMap } from "@/app/types";
import { FaTrash } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { MdError } from "react-icons/md";

import UserModalComponent from "../Navigation/UserModal";

import VerbaButton from "../Navigation/VerbaButton";
import { useTranslation } from "@/context/TranslationContext";

interface FileComponentProps {
  fileData: FileData;
  fileMap: FileMap;
  handleDeleteFile: (name: string) => void;
  selectedFileData: string | null;
  setSelectedFileData: (f: string | null) => void;
}

const FileComponent: React.FC<FileComponentProps> = ({
  fileData,
  fileMap,
  handleDeleteFile,
  selectedFileData,
  setSelectedFileData,
}) => {
  const { t } = useTranslation();

  const openDeleteModal = () => {
    const modal = document.getElementById(
      "remove_file_" + fileMap[fileData.fileID].filename
    );
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      {fileMap[fileData.fileID].status != "READY" ? (
        <div className="flex gap-2">
          {fileMap[fileData.fileID].status != "DONE" &&
            fileMap[fileData.fileID].status != "ERROR" && (
              <VerbaButton
                title={t(
                  statusTextMap[fileMap[fileData.fileID].status],
                  statusTextMap[fileMap[fileData.fileID].status]
                )}
                className="w-[120px]"
              />
            )}
          {fileMap[fileData.fileID].status == "DONE" && (
            <VerbaButton
              title={t(
                statusTextMap[fileMap[fileData.fileID].status],
                statusTextMap[fileMap[fileData.fileID].status]
              )}
              Icon={FaCheckCircle}
              selected={true}
              className="w-[120px]"
              selected_color={"bg-secondary-verba"}
            />
          )}
          {fileMap[fileData.fileID].status == "ERROR" && (
            <VerbaButton
              title={t(
                statusTextMap[fileMap[fileData.fileID].status],
                statusTextMap[fileMap[fileData.fileID].status]
              )}
              Icon={MdError}
              className="w-[120px]"
              selected={true}
              selected_color={"bg-warning-verba"}
            />
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <VerbaButton
            title={t(
              fileMap[fileData.fileID].rag_config["Reader"].selected,
              fileMap[fileData.fileID].rag_config["Reader"].selected
            )}
            className="w-[120px]"
            text_class_name="truncate w-[100px]"
          />
        </div>
      )}

      <VerbaButton
        title={
          fileMap[fileData.fileID].filename
            ? t(
                fileMap[fileData.fileID].filename,
                fileMap[fileData.fileID].filename
              )
            : t("common.no_filename", "No Filename")
        }
        selected={selectedFileData === fileMap[fileData.fileID].fileID}
        selected_color="bg-secondary-verba"
        className="flex-grow"
        text_class_name="truncate max-w-[150px] lg:max-w-[300px]"
        onClick={() => {
          setSelectedFileData(fileData.fileID);
        }}
      />

      <VerbaButton
        Icon={FaTrash}
        onClick={openDeleteModal}
        className="w-[50px]"
        selected={selectedFileData === fileMap[fileData.fileID].fileID}
        selected_color="bg-warning-verba"
      />

      <UserModalComponent
        modal_id={"remove_file_" + fileMap[fileData.fileID].filename}
        title={t("ingestion.remove_file", "Remove File")}
        text={
          fileMap[fileData.fileID].isURL
            ? t("ingestion.remove_url", "Do you want to remove the URL?")
            : t(
                "ingestion.remove_file_named",
                "Do you want to remove {{filename}} from the selection?",
                { filename: fileMap[fileData.fileID].filename }
              )
        }
        triggerString={t("common.delete", "Delete")}
        triggerValue={fileMap[fileData.fileID].fileID}
        triggerAccept={handleDeleteFile}
      />
    </div>
  );
};

export default FileComponent;
