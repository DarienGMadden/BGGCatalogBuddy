// See https://aka.ms/new-console-template for more information
using System.Text.Json;
using DataGenerator.Entities;

Console.WriteLine("Hello, World!");

string projectRoot = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.FullName;

// Define the relative path to the file from the project root
string filePath = Path.Combine(projectRoot, "templateData", "BGGCatalogExport.json");

int numberOfPlaysToGenerate = 1000;
int numberOfMonthsToGenerateFor = 36;
try
{
    // Read the file content
    string jsonString = File.ReadAllText(filePath);

    // Parse the JSON string to a JsonObject
    BGGCatalogData jsonObject = JsonSerializer.Deserialize<BGGCatalogData>(jsonString);


    GenerateData(jsonObject, numberOfPlaysToGenerate, numberOfMonthsToGenerateFor);

    string newFilePath = Path.Combine(projectRoot, "templateData", "NewBGGCatalogExport.json");
    SaveCatalogDataToJsonFile(jsonObject, newFilePath);
}
catch (FileNotFoundException)
{
    Console.WriteLine("The specified file was not found.");
}
catch (JsonException)
{
    Console.WriteLine("Error parsing the JSON content.");
}
catch (Exception ex)
{
    Console.WriteLine($"An unexpected error occurred: {ex.Message}");
}


void GenerateData(BGGCatalogData catalogData, int numberOfPlays, int numberOfMonths)
{
    Random random = new Random();

    // Get the current date
    DateTime currentDate = DateTime.Now;

    // Iterate for the specified number of plays to generate
    for (int i = 0; i < numberOfPlaysToGenerate; i++)
    {
        // 1. Pick a random game from the "games" list
        var randomGame = catalogData.Games[random.Next(catalogData.Games.Count)];

        // 2. Randomly generate a player count (between 2 and 5)
        int playerCount = random.Next(2, 6);

        // 3. Pick players randomly from the "players" list
        var selectedPlayers = catalogData.Players.OrderBy(x => random.Next()).Take(playerCount).ToList();

        // 4. Generate a random date within the range of "numberOfMonthsToGenerateFor" months
        DateTime generatedDate = currentDate.AddMonths(-random.Next(1, numberOfMonthsToGenerateFor + 1));

        // 5. Create a new play object and add it to the "plays" list
        var newPlayId = catalogData.Plays.Count + 1;  // Next available ID
        var newPlay = new Play
        {
            Id = newPlayId,
            PlayDate = generatedDate.ToString("yyyy-MM-dd HH:mm"),
            GameId = randomGame.Id,
            LocationId = 1, // Assuming locationId = 1 for simplicity
        };
        catalogData.Plays.Add(newPlay);

        // 6. Create "playerPlays" for each player in the selected list
        int playId = newPlayId;  // The ID of the play we just created
        int playerPlayId = catalogData.PlayersPlays.Count + 1;  // Next available ID for playerPlay

        // Track the highest score for determining the winner
        var newlyAddedPlays = new List<PlayersPlay>();

        foreach (var player in selectedPlayers)
        {
            // Generate a random score for each player (between 1 and 100)
            int score = random.Next(1, 101);

            // Create a new player play entry
            var newPlayerPlay = new PlayersPlay
            {
                Id = playerPlayId++,
                PlayId = playId,
                PlayerId = player.Id,
                Score = score,
            };

            newlyAddedPlays.Add(newPlayerPlay);
            // Add the player play to the list
            catalogData.PlayersPlays.Add(newPlayerPlay);
        }

        newlyAddedPlays.OrderByDescending(x => x.Score).FirstOrDefault().Winner = 1;
    }
}

void SaveCatalogDataToJsonFile(BGGCatalogData catalogData, string filePath)
{
    // Serialize the catalogData object to JSON format
    string jsonString = JsonSerializer.Serialize(catalogData, new JsonSerializerOptions { WriteIndented = true });

    // Write the JSON string to a file
    File.WriteAllText(filePath, jsonString);

    Console.WriteLine($"Catalog data has been successfully saved to: {filePath}");
}
