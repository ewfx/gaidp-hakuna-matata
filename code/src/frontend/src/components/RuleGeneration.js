import React, { useState, useEffect } from "react";
import {
	Card,
	CardHeader,
	CardContent,
	Button,
	Select,
	MenuItem,
	LinearProgress,
	Paper,
	Typography,
} from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { documentService } from "../services/api";

function RuleGeneration() {
	const [rules, setRules] = useState([]);
	const [uniqueFileNames, setUniqueFileNames] = useState([]);
	const [selectedRule, setSelectedRule] = useState("");
	const [validationCode, setValidationCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Simulate API call to load rules
		const fetchRules = async () => {
			setIsLoading(true);
			try {
				const docs = await documentService.getRules();

				const uniqueDocs = Array.from(
					new Map(docs.map((doc) => [doc.file_name, doc])).values()
				);

				console.log("Neel: Unique Docs: ", uniqueDocs);

				setRules(uniqueDocs);
				// await new Promise(resolve => setTimeout(resolve, 1000));
				// setRules([
				//   { id: 1, rule_name: "Amount Validation", fileName: "fileName1" },
				//   { id: 2, rule_name: "Date Format Check", fileName: "fileName1" },
				//   { id: 3, rule_name: "Currency Validation", fileName: "fileName2" }
				// ]);
				// setUniqueFileNames(
				//   [...new Set(rules.map(rules => rules.fileName))]
				// );
			} catch (error) {
				console.error("Error loading rules:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchRules();
	}, []);

	const handleGenerateCode = async () => {
		if (!selectedRule) return;
		setIsLoading(true);
		try {
			const docs = await documentService.getValidationCodeFromFileName(
				selectedRule
			);

			console.log("Neel, Validation Code: ", JSON.stringify(docs, 4, 4));

			setValidationCode(
				docs.rules.reduce((acc, rule) => acc + rule.function_code, "")
				// .replace(/\\/g, "")
			);
			// setRules(uniqueDocs);
			// 	// Simulate API call
			// 	await new Promise((resolve) => setTimeout(resolve, 1500));
			// setValidationCode(
			// 	`def validate_${selectedRule
			// 		.toLowerCase()
			// 		.replace(" ", "_")}(df):
			// """Validate ${selectedRule}"""
			// errors = df[df['amount'] > 10000].copy()
			// errors['field'] = 'amount'
			// errors['error'] = 'Amount exceeds limit'
			// return errors[['row_index', 'field', 'error']]`
			// );
		} catch (error) {
			setValidationCode(`# Error generating code:\n# ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader title="Rule Generation" />
			<CardContent>
				<Select
					value={selectedRule.file_name}
					onChange={(e) =>
						setSelectedRule(
							rules.find(
								(rule) => rule.file_name === e.target.value
							)
						)
					}
					fullWidth
					displayEmpty
					sx={{ mb: 2 }}
					disabled={isLoading || rules.length === 0}>
					<MenuItem value="" disabled>
						{isLoading ? "Loading rules..." : "Select a rule"}
					</MenuItem>
					{/* {[...new Set(rules.map((rules) => rules.fileName))].map(
						(rule) => (
							<MenuItem key={rule} value={rule}>
								{rule}
							</MenuItem>
						)
					)} */}
					{rules.map((rule) => (
						<MenuItem key={rule.id} value={rule.file_name}>
							{rule.file_name}
						</MenuItem>
					))}
				</Select>

				<Button
					variant="contained"
					onClick={handleGenerateCode}
					disabled={!selectedRule || isLoading}
					fullWidth>
					Generate Validation Code
				</Button>

				{isLoading && <LinearProgress sx={{ mt: 2 }} />}

				{/* {validationCode && (
					<Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
						<Typography
							variant="body2"
							component="pre"
							sx={{ whiteSpace: "pre-wrap" }}>
							{validationCode}
						</Typography>
					</Paper>
				)} */}
				{validationCode && (
					<Card variant="outlined" sx={{ p: 2, mt: 2 }}>
						<SyntaxHighlighter
							language="python"
							style={materialDark}>
							{validationCode}
						</SyntaxHighlighter>
					</Card>
				)}
			</CardContent>
		</Card>
	);
}

export default RuleGeneration;
