export default function GallerySkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] bg-gray-100 rounded-[30px] animate-pulse" />
                    <div className="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
            ))}
        </div>
    );
}
