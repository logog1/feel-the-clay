import { defineMcp } from "@lovable.dev/mcp-js";
import listWorkshops from "./tools/list-workshops";
import listBlogPosts from "./tools/list-blog-posts";
import listProducts from "./tools/list-products";
import checkAvailability from "./tools/check-availability";

export default defineMcp({
  name: "terraria-workshops-mcp",
  title: "Terraria Workshops MCP",
  version: "0.1.0",
  instructions:
    "Tools for exploring Terraria Workshops: list handcraft workshops and pricing, check availability of upcoming sessions, browse the online store, and read the blog.",
  tools: [listWorkshops, checkAvailability, listBlogPosts, listProducts],
});
