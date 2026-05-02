-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "google_maps_url" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "longitude" DECIMAL(11,8);
