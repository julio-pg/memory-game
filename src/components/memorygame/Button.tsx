export default function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700" onClick={onClick}>
      {children}
    </button>
  )
}
