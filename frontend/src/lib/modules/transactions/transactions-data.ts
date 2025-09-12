export interface Transaction {
	id: string;
	date: Date;
	description: string;
	category: 'income' | 'expense' | 'transfer';
	type: string; // subcategory like 'salary', 'food', 'transport', etc.
	amount: number;
	account?: string;
	notes?: string;
}

export const transactionCategories = {
	income: {
		label: 'Income',
		icon: '💰',
		types: {
			salary: 'Salary',
			freelance: 'Freelance',
			investment: 'Investment Return',
			gift: 'Gift',
			other: 'Other Income'
		}
	},
	expense: {
		label: 'Expense',
		icon: '💸',
		types: {
			food: 'Food & Dining',
			transport: 'Transportation',
			shopping: 'Shopping',
			bills: 'Bills & Utilities',
			entertainment: 'Entertainment',
			health: 'Healthcare',
			education: 'Education',
			other: 'Other Expense'
		}
	},
	transfer: {
		label: 'Transfer',
		icon: '🔄',
		types: {
			account: 'Between Accounts',
			investment: 'To Investment',
			savings: 'To Savings',
			other: 'Other Transfer'
		}
	}
};

export const mockTransactions: Transaction[] = [
	// Today's transactions
	{
		id: '1',
		date: new Date(),
		description: 'Lunch at Warung Padang',
		category: 'expense',
		type: 'food',
		amount: 35000,
		account: 'BCA Debit',
		notes: 'Nasi rendang + es teh'
	},
	{
		id: '2',
		date: new Date(),
		description: 'Grab to Office',
		category: 'expense',
		type: 'transport',
		amount: 25000,
		account: 'GoPay'
	},
	{
		id: '3',
		date: new Date(),
		description: 'Freelance Project Payment',
		category: 'income',
		type: 'freelance',
		amount: 5000000,
		account: 'BCA Savings',
		notes: 'Website development project'
	},
	// Yesterday's transactions
	{
		id: '4',
		date: new Date(Date.now() - 86400000),
		description: 'Grocery Shopping at Superindo',
		category: 'expense',
		type: 'shopping',
		amount: 450000,
		account: 'BCA Debit'
	},
	{
		id: '5',
		date: new Date(Date.now() - 86400000),
		description: 'Internet Bill',
		category: 'expense',
		type: 'bills',
		amount: 599000,
		account: 'BCA Debit',
		notes: 'Monthly Indihome'
	},
	// 2 days ago
	{
		id: '6',
		date: new Date(Date.now() - 172800000),
		description: 'Monthly Salary',
		category: 'income',
		type: 'salary',
		amount: 15000000,
		account: 'BCA Savings'
	},
	{
		id: '7',
		date: new Date(Date.now() - 172800000),
		description: 'Transfer to Investment Account',
		category: 'transfer',
		type: 'investment',
		amount: 3000000,
		account: 'BCA Savings',
		notes: 'Monthly investment allocation'
	},
	{
		id: '8',
		date: new Date(Date.now() - 172800000),
		description: 'Coffee at Starbucks',
		category: 'expense',
		type: 'food',
		amount: 65000,
		account: 'BCA Debit'
	},
	// 3 days ago
	{
		id: '9',
		date: new Date(Date.now() - 259200000),
		description: 'Gym Membership',
		category: 'expense',
		type: 'health',
		amount: 500000,
		account: 'BCA Debit',
		notes: 'Monthly subscription'
	},
	{
		id: '10',
		date: new Date(Date.now() - 259200000),
		description: 'Dividend from BBCA',
		category: 'income',
		type: 'investment',
		amount: 250000,
		account: 'BCA Savings'
	}
];

export function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
	const grouped = new Map<string, Transaction[]>();
	
	// Sort transactions by date (newest first)
	const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
	
	sorted.forEach(transaction => {
		const dateKey = formatDateKey(transaction.date);
		if (!grouped.has(dateKey)) {
			grouped.set(dateKey, []);
		}
		grouped.get(dateKey)!.push(transaction);
	});
	
	return grouped;
}

export function formatDateKey(date: Date): string {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	
	const isToday = date.toDateString() === today.toDateString();
	const isYesterday = date.toDateString() === yesterday.toDateString();
	
	if (isToday) return 'Today';
	if (isYesterday) return 'Yesterday';
	
	return new Intl.DateTimeFormat('id-ID', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
}

export function calculateDailyTotal(transactions: Transaction[]): {
	income: number;
	expense: number;
	net: number;
} {
	const income = transactions
		.filter(t => t.category === 'income')
		.reduce((sum, t) => sum + t.amount, 0);
	
	const expense = transactions
		.filter(t => t.category === 'expense')
		.reduce((sum, t) => sum + t.amount, 0);
	
	return {
		income,
		expense,
		net: income - expense
	};
}

export function getCategoryIcon(category: string): string {
	return transactionCategories[category as keyof typeof transactionCategories]?.icon || '📝';
}

export function getCategoryColor(category: string): string {
	switch (category) {
		case 'income': return 'text-green-600';
		case 'expense': return 'text-red-600';
		case 'transfer': return 'text-blue-600';
		default: return 'text-gray-600';
	}
}