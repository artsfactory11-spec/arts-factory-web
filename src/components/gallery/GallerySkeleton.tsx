export default function GallerySkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                    <div className="h-4 bg-gray-200 animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
                </div>
            ))}
        </div>
    );
}
