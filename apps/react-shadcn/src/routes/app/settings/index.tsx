import { createFileRoute } from "@tanstack/react-router"

import { useState } from "react"
import type { Color } from "react-aria-components"
import { ColorField, ColorSwatch, parseColor, Radio, RadioGroup } from "react-aria-components"
import { Dark, Light, System } from "~/components/application/modals/appearances"

import { SectionHeader } from "~/components/application/section-headers/section-headers"
import { SectionLabel } from "~/components/application/section-headers/section-label"

import { Button } from "~/components/base/buttons/button"
import { FileTrigger } from "~/components/base/file-upload-trigger/file-upload-trigger"
import { Form } from "~/components/base/form/form"
import { InputBase } from "~/components/base/input/input"
import { RadioButtonBase } from "~/components/base/radio-buttons/radio-buttons"
import { Select } from "~/components/base/select/select"
import { type Theme, useTheme } from "~/components/theme-provider"

import { cx } from "~/utils/cx"

export const Route = createFileRoute("/app/settings/")({
	component: AppearanceSettings,
})

function AppearanceSettings() {
	const colorSwatches = [
		"#535862",
		"#099250",
		"#1570EF",
		"#444CE7",
		"#6938EF",
		"#BA24D5",
		"#DD2590",
		"#E04F16",
	]

	const [customColor, setCustomColor] = useState<Color>(parseColor("#7F56D9"))
	const [color, setColor] = useState<Color>(customColor)
	const [uploadedAvatar, setUploadedAvatar] = useState<string | undefined>(
		"https://www.untitledui.com/logos/images/ContrastAI.jpg",
	)

	const { theme, setTheme } = useTheme()

	const handleAvatarUpload = (files: FileList | null) => {
		const file = files?.[0]

		if (!file) return

		console.log("File uploaded:", file)
		setUploadedAvatar(URL.createObjectURL(file))
	}

	const handleCustomColorChange = (value: Color | null) => {
		if (!value) return

		// If the custom color is already selected, update the color.
		if (color.toString("hex") === customColor.toString("hex")) {
			setColor(value)
		}

		setCustomColor(value)
	}

	const themes = [
		{
			value: "system",
			label: "System preference",
			component: System,
		},
		{
			value: "light",
			label: "Light mode",
			component: Light,
		},
		{
			value: "dark",
			label: "Dark mode",
			component: Dark,
		},
	]

	return (
		<Form
			className="flex flex-col gap-6 px-4 lg:px-8"
			onSubmit={(e) => {
				e.preventDefault()
				const data = Object.fromEntries(new FormData(e.currentTarget))
				console.log("Form data:", data)
			}}
		>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Appearance</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Change how your dashboard looks and feels.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{/* Form content */}
			<div className="flex flex-col gap-5">
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Company logo"
						description="Update your company logo."
					/>

					<div className="flex items-center gap-5">
						<img
							src={uploadedAvatar}
							alt="Company logo"
							className="size-16 rounded-2xl object-cover ring-1 ring-avatar-contrast-border ring-inset"
						/>

						<div className="flex gap-4">
							<FileTrigger acceptedFileTypes={["image/*"]} onSelect={handleAvatarUpload}>
								<Button size="sm" color="secondary">
									Replace logo
								</Button>
							</FileTrigger>
						</div>
					</div>
				</div>

				<hr className="h-px w-full border-none bg-border-secondary" />

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Brand color"
						description="Select or customize your brand color."
					/>

					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<RadioGroup
							aria-label="Brand color"
							value={color?.toString("hex")}
							onChange={(value) => setColor(parseColor(value))}
							className="flex flex-col items-start gap-4 md:flex-row md:items-center"
						>
							<div className="flex gap-2">
								{colorSwatches.map((color) => (
									<Radio
										key={color}
										value={color}
										aria-label={parseColor(color).getColorName("en-US")}
									>
										{({ isSelected, isFocused }) => (
											<ColorSwatch
												id={`color-${color}`}
												color={color}
												className={cx(
													"-outline-offset-1 size-7 cursor-pointer rounded-full outline-1 outline-black/10",
													(isSelected || isFocused) &&
														"ring-2 ring-focus-ring ring-offset-2 ring-offset-bg-primary",
												)}
											/>
										)}
									</Radio>
								))}
							</div>
							<Radio
								value={customColor.toString("hex")}
								aria-label={customColor.getColorName("en-US")}
								className="flex shrink-0 items-center gap-3"
							>
								{({ isSelected, isFocused }) => (
									<>
										<label
											htmlFor="custom-color-input"
											className="font-semibold text-secondary text-sm"
										>
											Custom
										</label>
										<ColorSwatch
											color={customColor}
											className={cx(
												"-outline-offset-1 size-7 shrink-0 cursor-pointer rounded-full outline-1 outline-black/10",
												(isSelected || isFocused) &&
													"ring-2 ring-focus-ring ring-offset-2 ring-offset-bg-primary",
											)}
										/>
										<ColorField
											className="md:hidden"
											value={customColor}
											onChange={handleCustomColorChange}
										>
											<InputBase
												id="custom-color-input"
												size="sm"
												wrapperClassName="w-24"
											/>
										</ColorField>
									</>
								)}
							</Radio>
						</RadioGroup>
						<ColorField
							value={customColor}
							onChange={handleCustomColorChange}
							className="max-md:hidden"
						>
							<InputBase size="sm" wrapperClassName="w-24" />
						</ColorField>
					</div>
				</div>

				<hr className="h-px w-full border-none bg-border-secondary" />

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Display preference"
						description="Switch between light and dark modes."
					/>

					<div className="-m-4 w-screen overflow-auto p-4 lg:w-[calc(100%+48px)]">
						<RadioGroup
							aria-label="Display preference"
							defaultValue="system"
							className="flex gap-5"
							value={theme}
							onChange={(value) => setTheme(value as Theme)}
						>
							{themes.map((theme) => (
								<Radio
									key={theme.value}
									value={theme.value}
									aria-label={theme.label}
									className="flex cursor-pointer flex-col gap-3"
								>
									{({ isSelected, isFocusVisible }) => (
										<>
											<section
												className={cx(
													"relative h-33 w-50 rounded-[10px] bg-utility-gray-100",
													isSelected &&
														"outline-2 outline-focus-ring outline-offset-2",
												)}
											>
												<theme.component className="size-full" />

												{isSelected && (
													<RadioButtonBase
														size="md"
														isSelected={isSelected}
														isFocusVisible={isFocusVisible}
														className="absolute bottom-2 left-2"
													/>
												)}
											</section>
											<section className="w-full">
												<p className="font-semibold text-primary text-sm">
													{theme.label}
												</p>
											</section>
										</>
									)}
								</Radio>
							))}
						</RadioGroup>
					</div>
				</div>

				<hr className="h-px w-full border-none bg-border-secondary" />

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Language"
						description="Default language for public dashboard."
					/>

					<div className="w-max min-w-50">
						<Select
							name="language"
							aria-label="Language"
							size="sm"
							defaultSelectedKey="en-US"
							items={[
								{
									id: "en-US",
									label: "English (US)",
									icon: (
										<img
											src="https://www.untitledui.com/images/flags/US.svg"
											alt="United States flag"
											className="size-5"
										/>
									),
								},
								{
									id: "de-DE",
									label: "German (DE)",
									icon: (
										<img
											src="https://www.untitledui.com/images/flags/DE.svg"
											alt="German flag"
											className="size-5"
										/>
									),
								},
								{
									id: "es-ES",
									label: "Spanish (ES)",
									icon: (
										<img
											src="https://www.untitledui.com/images/flags/ES.svg"
											alt="Spanish flag"
											className="size-5"
										/>
									),
								},
							]}
						>
							{(item) => (
								<Select.Item id={item.id} icon={item.icon}>
									{item.label}
								</Select.Item>
							)}
						</Select>
					</div>
				</div>
			</div>
		</Form>
	)
}
