import type { Id } from "@hazel/backend"
import { useParams } from "@tanstack/react-router"
import { Attachment01, FaceSmile, XClose } from "@untitledui/icons"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { Dialog, DialogTrigger, Popover } from "react-aria-components"
import { useEmojiStats } from "~/hooks/use-emoji-stats"
import { useFileUpload } from "~/hooks/use-file-upload"
import { cx } from "~/utils/cx"
import { Button } from "../base/buttons/button"
import { ButtonUtility } from "../base/buttons/button-utility"
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "../base/emoji-picker/emoji-picker"

export interface MessageComposerActionsRef {
	cleanup: () => void
}

interface MessageComposerActionsProps {
	attachmentIds: Id<"attachments">[]
	setAttachmentIds: (ids: Id<"attachments">[]) => void
	uploads: Array<{
		fileId: string
		fileName: string
		progress: number
		status: string
		attachmentId?: Id<"attachments">
	}>
	onSubmit?: () => Promise<void>
	onEmojiSelect?: (emoji: string) => void
}

export const MessageComposerActions = forwardRef<MessageComposerActionsRef, MessageComposerActionsProps>(
	({ attachmentIds, setAttachmentIds, uploads, onSubmit, onEmojiSelect }, ref) => {
		const { orgId } = useParams({ from: "/_app/$orgId" })
		const fileInputRef = useRef<HTMLInputElement>(null)
		const [showUploadProgress, setShowUploadProgress] = useState(false)
		const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
		const { trackEmojiUsage } = useEmojiStats()

		const { uploadFiles, clearUploads, isUploading } = useFileUpload({
			organizationId: orgId as Id<"organizations">,
			onUploadComplete: (attachmentId) => {
				setAttachmentIds([...attachmentIds, attachmentId])
			},
		})

		const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files
			if (files && files.length > 0) {
				setShowUploadProgress(true)
				await uploadFiles(files)
			}
			// Reset input
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		}

		const handleSubmit = async () => {
			if (onSubmit) {
				await onSubmit()
			}
		}

		// Expose cleanup method to parent component
		useImperativeHandle(
			ref,
			() => ({
				cleanup: () => {
					clearUploads()
					setShowUploadProgress(false)
				},
			}),
			[clearUploads],
		)

		return (
			<>
				{/* Upload Progress */}
				{showUploadProgress && uploads.length > 0 && (
					<div className="absolute right-0 bottom-full left-0 mx-3 mb-2">
						<div className="rounded-lg bg-primary p-2 ring-1 ring-secondary ring-inset">
							<div className="mb-1 flex items-center justify-between">
								<span className="font-medium text-secondary text-xs">Uploading files...</span>
								<ButtonUtility
									icon={XClose}
									size="xs"
									color="tertiary"
									onClick={() => setShowUploadProgress(false)}
								/>
							</div>
							<div className="space-y-1">
								{uploads.map((upload) => (
									<div key={upload.fileId} className="flex items-center gap-2">
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<span className="max-w-[200px] truncate text-tertiary text-xs">
													{upload.fileName}
												</span>
												<span className="text-quaternary text-xs">
													{upload.progress}%
												</span>
											</div>
											<div className="mt-0.5 h-1 overflow-hidden rounded-full bg-secondary">
												<div
													className={cx(
														"h-full transition-all duration-300",
														upload.status === "complete"
															? "bg-success"
															: "bg-brand",
														upload.status === "failed" && "bg-error",
													)}
													style={{ width: `${upload.progress}%` }}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					multiple
					className="hidden"
					onChange={handleFileSelect}
					accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
				/>

				<div className="absolute right-3.5 bottom-2 flex items-center gap-2">
					<div className="flex items-center gap-0.5">
						<ButtonUtility
							icon={Attachment01}
							size="xs"
							color="tertiary"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
						/>
						<DialogTrigger isOpen={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
							<ButtonUtility icon={FaceSmile} size="xs" color="tertiary" />
							<Popover>
								<Dialog className="rounded-lg">
									<EmojiPicker
										className="h-[342px]"
										onEmojiSelect={(emoji) => {
											if (onEmojiSelect) {
												trackEmojiUsage(emoji.emoji)
												onEmojiSelect(emoji.emoji)
											}
											setEmojiPickerOpen(false)
										}}
									>
										<EmojiPickerSearch />
										<EmojiPickerContent />
										<EmojiPickerFooter />
									</EmojiPicker>
								</Dialog>
							</Popover>
						</DialogTrigger>
					</div>

					<Button size="sm" color="link-color" onClick={handleSubmit} disabled={isUploading}>
						Send
					</Button>
				</div>
			</>
		)
	},
)
