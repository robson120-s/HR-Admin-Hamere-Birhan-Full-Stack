import * as React from "react"

export const Table = ({ children }) => <table className="table-auto w-full">{children}</table>
export const TableHeader = ({ children }) => <thead className="bg-gray-100">{children}</thead>
export const TableBody = ({ children }) => <tbody>{children}</tbody>
export const TableRow = ({ children }) => <tr>{children}</tr>
export const TableCell = ({ children }) => <td className="border px-4 py-2">{children}</td>
