import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";

interface VideoSuggestion {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  url: string;
}

const videoDatabase: Record<string, VideoSuggestion[]> = {
  Recyclable: [
    { id: "1", title: "How Plastic Bottles Are Recycled Into New Products", channel: "Insider", thumbnail: "https://img.youtube.com/vi/6jQ7y_qQYUA/mqdefault.jpg", duration: "8:23", url: "https://www.youtube.com/watch?v=6jQ7y_qQYUA" },
    { id: "2", title: "DIY: Turn Old Glass Jars Into Beautiful Decor", channel: "5-Minute Crafts", thumbnail: "https://img.youtube.com/vi/DFjqmFkKTuU/mqdefault.jpg", duration: "10:15", url: "https://www.youtube.com/watch?v=DFjqmFkKTuU" },
    { id: "3", title: "Recycling 101: What You Need to Know", channel: "NatGeo", thumbnail: "https://img.youtube.com/vi/b7GMKSsMxy0/mqdefault.jpg", duration: "5:42", url: "https://www.youtube.com/watch?v=b7GMKSsMxy0" },
  ],
  Compostable: [
    { id: "4", title: "How to Start Composting at Home (Beginner Guide)", channel: "Epic Gardening", thumbnail: "https://img.youtube.com/vi/egyNJ7xPyoQ/mqdefault.jpg", duration: "12:05", url: "https://www.youtube.com/watch?v=egyNJ7xPyoQ" },
    { id: "5", title: "Kitchen Waste to Garden Gold: Easy Composting", channel: "Garden Answer", thumbnail: "https://img.youtube.com/vi/oL3JjLGfspU/mqdefault.jpg", duration: "7:18", url: "https://www.youtube.com/watch?v=oL3JjLGfspU" },
    { id: "6", title: "Vermicomposting: Turn Food Scraps Into Fertilizer", channel: "Learn Organic", thumbnail: "https://img.youtube.com/vi/AiOCj7TE8lw/mqdefault.jpg", duration: "9:30", url: "https://www.youtube.com/watch?v=AiOCj7TE8lw" },
  ],
  Hazardous: [
    { id: "7", title: "How to Safely Dispose of Batteries & E-Waste", channel: "Tech Insider", thumbnail: "https://img.youtube.com/vi/GHNx8GXMRA8/mqdefault.jpg", duration: "6:45", url: "https://www.youtube.com/watch?v=GHNx8GXMRA8" },
    { id: "8", title: "What Happens to Your Old Electronics?", channel: "Verge Science", thumbnail: "https://img.youtube.com/vi/LagGJKsiFnw/mqdefault.jpg", duration: "11:20", url: "https://www.youtube.com/watch?v=LagGJKsiFnw" },
    { id: "9", title: "Household Chemical Disposal: Do It Right", channel: "Clean Home", thumbnail: "https://img.youtube.com/vi/TiI2s3JrK-Y/mqdefault.jpg", duration: "4:55", url: "https://www.youtube.com/watch?v=TiI2s3JrK-Y" },
  ],
  Landfill: [
    { id: "10", title: "What Really Happens at a Landfill?", channel: "SciShow", thumbnail: "https://img.youtube.com/vi/UzaM3ZHiRGs/mqdefault.jpg", duration: "8:10", url: "https://www.youtube.com/watch?v=UzaM3ZHiRGs" },
    { id: "11", title: "Reducing Landfill Waste: Simple Swaps", channel: "Sustainably Vegan", thumbnail: "https://img.youtube.com/vi/K_LvRPX0rGY/mqdefault.jpg", duration: "7:35", url: "https://www.youtube.com/watch?v=K_LvRPX0rGY" },
  ],
  Upcyclable: [
    { id: "12", title: "Amazing Upcycle Ideas From Trash to Treasure", channel: "DIY Creators", thumbnail: "https://img.youtube.com/vi/sbGjr2eLxvY/mqdefault.jpg", duration: "14:22", url: "https://www.youtube.com/watch?v=sbGjr2eLxvY" },
    { id: "13", title: "Turn Plastic Bottles Into a Self-Watering Planter", channel: "Creative Ideas", thumbnail: "https://img.youtube.com/vi/C_tn7CVaQiU/mqdefault.jpg", duration: "6:15", url: "https://www.youtube.com/watch?v=C_tn7CVaQiU" },
    { id: "14", title: "Upcycling Old Clothes: 10 Creative Projects", channel: "Crafty Panda", thumbnail: "https://img.youtube.com/vi/Qdwqeg5n3uE/mqdefault.jpg", duration: "11:48", url: "https://www.youtube.com/watch?v=Qdwqeg5n3uE" },
  ],
};

interface Props {
  category: string;
  itemName: string;
}

const VideoSuggestions = ({ category, itemName }: Props) => {
  const videos = videoDatabase[category] || videoDatabase["Recyclable"];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-display font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
        <Play size={14} className="text-destructive" />
        Learn More
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {videos.slice(0, 3).map((video, i) => (
          <motion.a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-56 rounded-xl overflow-hidden bg-surface-alt border border-border hover:border-primary/30 transition-colors group"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          >
            <div className="relative aspect-video bg-muted">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={14} className="text-primary-foreground ml-0.5" fill="white" />
                </div>
              </div>
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-foreground/80 text-[10px] font-data text-primary-foreground">
                {video.duration}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs font-display font-bold text-foreground line-clamp-2 leading-tight">
                {video.title}
              </p>
              <p className="text-[10px] font-data text-muted-foreground mt-1 flex items-center gap-1">
                {video.channel}
                <ExternalLink size={8} />
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default VideoSuggestions;
