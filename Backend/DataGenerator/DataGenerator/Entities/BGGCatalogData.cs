using System.Text.Json.Serialization;

namespace DataGenerator.Entities
{
    public class BGGCatalogData
    {
        [JsonPropertyName("games")]
        public List<Game> Games { get; set; }

        [JsonPropertyName("players")]
        public List<Player> Players { get; set; }

        [JsonPropertyName("locations")]
        public List<Location> Locations { get; set; }

        [JsonPropertyName("plays")]
        public List<Play> Plays { get; set; }

        [JsonPropertyName("playersPlays")]
        public List<PlayersPlay> PlayersPlays { get; set; }

        [JsonPropertyName("mettings")]
        public List<Metting> Mettings { get; set; }

        [JsonPropertyName("campaigns")]
        public List<Campaign> Campaigns { get; set; }

        [JsonPropertyName("playerCampaigns")]
        public List<PlayerCampaign> PlayerCampaigns { get; set; }

        [JsonPropertyName("lents")]
        public List<object> Lents { get; set; }

        [JsonPropertyName("finalScoringCategories")]
        public List<object> FinalScoringCategories { get; set; }

        [JsonPropertyName("finalScoring")]
        public List<object> FinalScoring { get; set; }

        [JsonPropertyName("images")]
        public List<object> Images { get; set; }

        [JsonPropertyName("things")]
        public List<object> Things { get; set; }
    }

    public class Game
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("bggId")]
        public int BggId { get; set; }

        [JsonPropertyName("cooperative")]
        public int Cooperative { get; set; }

        [JsonPropertyName("yearPublished")]
        public int YearPublished { get; set; }

        [JsonPropertyName("minPlayers")]
        public int MinPlayers { get; set; }

        [JsonPropertyName("maxPlayers")]
        public int MaxPlayers { get; set; }

        [JsonPropertyName("minPlayTime")]
        public int MinPlayTime { get; set; }

        [JsonPropertyName("maxPlayTime")]
        public int MaxPlayTime { get; set; }

        [JsonPropertyName("minAge")]
        public int MinAge { get; set; }

        [JsonPropertyName("urlThumb")]
        public string UrlThumb { get; set; }

        [JsonPropertyName("urlImage")]
        public string UrlImage { get; set; }

        [JsonPropertyName("widthImage")]
        public double WidthImage { get; set; }

        [JsonPropertyName("heightImage")]
        public double HeightImage { get; set; }

        [JsonPropertyName("dominantColor")]
        public string DominantColor { get; set; }

        [JsonPropertyName("mutedColor")]
        public string MutedColor { get; set; }

        [JsonPropertyName("darkMutedColor")]
        public string DarkMutedColor { get; set; }

        [JsonPropertyName("designers")]
        public string Designers { get; set; }

        [JsonPropertyName("artists")]
        public string Artists { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("privateNotes")]
        public int PrivateNotes { get; set; }

        [JsonPropertyName("own")]
        public int Own { get; set; }

        [JsonPropertyName("prevOwned")]
        public int PrevOwned { get; set; }

        [JsonPropertyName("forTrade")]
        public int ForTrade { get; set; }

        [JsonPropertyName("want")]
        public int Want { get; set; }

        [JsonPropertyName("wantToPlay")]
        public int WantToPlay { get; set; }

        [JsonPropertyName("wantToBuy")]
        public int WantToBuy { get; set; }

        [JsonPropertyName("wishlist")]
        public int Wishlist { get; set; }

        [JsonPropertyName("preOrdered")]
        public int PreOrdered { get; set; }

        [JsonPropertyName("bggCollId")]
        public int? BggCollId { get; set; }

        [JsonPropertyName("wishlistPriority")]
        public int WishlistPriority { get; set; }

        [JsonPropertyName("visible")]
        public int Visible { get; set; }

        [JsonPropertyName("expansion")]
        public int Expansion { get; set; }

        [JsonPropertyName("average")]
        public double Average { get; set; }

        [JsonPropertyName("averageWeight")]
        public double AverageWeight { get; set; }

        [JsonPropertyName("rankBoardgame")]
        public int RankBoardgame { get; set; }

        [JsonPropertyName("addedDate")]
        public string AddedDate { get; set; }

        [JsonPropertyName("myRating")]
        public double MyRating { get; set; }

        [JsonPropertyName("calculateWinner")]
        public int? CalculateWinner { get; set; }

        [JsonPropertyName("tags")]
        public List<string> Tags { get; set; }

        [JsonPropertyName("copies")]
        public int Copies { get; set; }

        [JsonPropertyName("bgaGameName")]
        public string BgaGameName { get; set; }
    }

    public class Player
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("color")]
        public string Color { get; set; }

        [JsonPropertyName("me")]
        public int Me { get; set; }

        [JsonPropertyName("image")]
        public string Image { get; set; }

        [JsonPropertyName("bggUsername")]
        public string BggUsername { get; set; }

        [JsonPropertyName("bgaUsername")]
        public string BgaUsername { get; set; }

        [JsonPropertyName("isAnonymous")]
        public int IsAnonymous { get; set; }

        [JsonPropertyName("isAutoma")]
        public int IsAutoma { get; set; }
    }

    public class Location
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("color")]
        public string Color { get; set; }
    }

    public class Play
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("playDate")]
        public string PlayDate { get; set; }

        [JsonPropertyName("gameId")]
        public int GameId { get; set; }

        [JsonPropertyName("locationId")]
        public int LocationId { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("privateNotes")]
        public int PrivateNotes { get; set; }

        [JsonPropertyName("online")]
        public int Online { get; set; }

        [JsonPropertyName("bggPlayId")]
        public int BggPlayId { get; set; }

        [JsonPropertyName("length")]
        public int Length { get; set; }

        [JsonPropertyName("incomplete")]
        public int? Incomplete { get; set; }

        [JsonPropertyName("mettingId")]
        public int? MettingId { get; set; }

        [JsonPropertyName("leagueId")]
        public int? LeagueId { get; set; }

        [JsonPropertyName("expansionBggIds")]
        public string ExpansionBggIds { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("tags")]
        public List<string> Tags { get; set; }

        [JsonPropertyName("noInStats")]
        public int NoInStats { get; set; }

        [JsonPropertyName("campaignId")]
        public int? CampaignId { get; set; }

        [JsonPropertyName("bgaId")]
        public int? BgaId { get; set; }
    }

    public class PlayersPlay
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("playId")]
        public int PlayId { get; set; }

        [JsonPropertyName("playerId")]
        public int PlayerId { get; set; }

        [JsonPropertyName("score")]
        public int Score { get; set; }

        [JsonPropertyName("winner")]
        public int Winner { get; set; }

        [JsonPropertyName("startPlayer")]
        public int StartPlayer { get; set; }

        [JsonPropertyName("seatOrder")]
        public int? SeatOrder { get; set; }

        [JsonPropertyName("color")]
        public string Color { get; set; }

        [JsonPropertyName("team")]
        public string Team { get; set; }

        [JsonPropertyName("nickname")]
        public string Nickname { get; set; }
    }

    public class Metting
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("players")]
        public string Players { get; set; }

        [JsonPropertyName("locationId")]
        public int? LocationId { get; set; }

        [JsonPropertyName("games")]
        public string Games { get; set; }

        [JsonPropertyName("active")]
        public int Active { get; set; }

        [JsonPropertyName("finished")]
        public int Finished { get; set; }

        [JsonPropertyName("initialDate")]
        public string InitialDate { get; set; }
    }

    public class Campaign
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("gameId")]
        public int GameId { get; set; }

        [JsonPropertyName("completed")]
        public int Completed { get; set; }

        [JsonPropertyName("createdDate")]
        public string CreatedDate { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }
    }

    public class PlayerCampaign
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("campaignId")]
        public int CampaignId { get; set; }

        [JsonPropertyName("playerId")]
        public int PlayerId { get; set; }

        [JsonPropertyName("score")]
        public int? Score { get; set; }

        [JsonPropertyName("winner")]
        public int Winner { get; set; }
    }
}
