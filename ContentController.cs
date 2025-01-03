using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Management.HadrData;
using Microsoft.SqlServer.Management.Sdk.Sfc;
using Microsoft.SqlServer.Management.Smo;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Metrics;
using static Hydraulic_Manifold_API.GlobalClass;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Hydraulic_Manifold_API.Controllers
{

    [Route("api/[controller]")]
    [EnableCors("OpenCORSPolicy")]
    [ApiController]
    public class ContentController : ControllerBase
    {
        //private readonly AppDbContext _context;
        private readonly ILogger<ContentController> _logger;
        private readonly string _connectionString;

        public ContentController(ILogger<ContentController> logger, IConfiguration configuration)
        {
            //_context = context;
            _logger = logger;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet("getContentData")]
        public async Task<ActionResult> getContentData()
        {


            string sqlDataSource = _connectionString ?? "Data Source=SANJEEV\\SQLEXPRESS; Initial Catalog=master; TrustServerCertificate=True; User ID=sa; Password=candy";
            _logger.LogInformation($"Connection string: {sqlDataSource}");

            string query = @"USE [MB]SELECT * from User_manual";

            SqlDataReader myReader;
            SqlDataReader myReader1;
            DataTable Dt = new DataTable();
            using (SqlConnection myCon = new SqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myReader = myCommand.ExecuteReader();
                    Dt.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            Samsung[] oget_Content = new Samsung[Dt.Rows.Count];
            for (int i = 0; i < Dt.Rows.Count; i++)
            {
                Samsung ooget_Content = new Samsung();
                //ooget_Content.row_id = int.Parse(Dt.Rows[i][0].ToString());
                ooget_Content.Content_ID = float.Parse(Dt.Rows[i][0].ToString());
                ooget_Content.Ordering = float.Parse(Dt.Rows[i][1].ToString());
                ooget_Content.Content_Type = Dt.Rows[i][2].ToString();
                ooget_Content.Content = Dt.Rows[i][3].ToString();
                ooget_Content.ImageURL = Dt.Rows[i][4].ToString();
                ooget_Content.Image_Text = Dt.Rows[i][5].ToString();

                oget_Content[i] = ooget_Content;
            }

            return new JsonResult(oget_Content);
        }

        [HttpGet("updateContentData")]

        public async Task<IActionResult> UpdateContentData(
                    int rowIndex,
                    string colIndex,
                    string content_ID,
                    string ordering,
                    string content_Type,
                    string content,
                    string imageURL,
                    string image_Text)
        {
            string sqlDataSource = "Data Source=SANJEEV\\SQLEXPRESS; Initial Catalog=MB; TrustServerCertificate=True; User ID=sa; Password=candy";

            try
            {

                string updateQuery = @"WITH RowNumbered AS ( SELECT *, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RowNum FROM User_manual)
                                      UPDATE RowNumbered
                                                   SET Content_ID = @Content_ID, 
                                                                    Ordering = @Ordering, 
                                                                    Content_Type = @Content_Type, 
                                                                    Content = @Content,
                                                                    ImageURL = @ImageURL,
                                                                    ImageText = @ImageText
                                                     WHERE RowNum = @RowIndex";

                using (SqlConnection connection = new SqlConnection(sqlDataSource))
                {
                    await connection.OpenAsync();
                    using (SqlCommand updateCommand = new SqlCommand(updateQuery, connection))
                    {
                        // Add parameters
                        updateCommand.Parameters.AddWithValue("@RowIndex", rowIndex);
                        updateCommand.Parameters.AddWithValue("@Content_ID", content_ID ?? (object)DBNull.Value);
                        updateCommand.Parameters.AddWithValue("@Ordering", ordering ?? (object)DBNull.Value);
                        updateCommand.Parameters.AddWithValue("@Content_Type", content_Type ?? (object)DBNull.Value);
                        updateCommand.Parameters.AddWithValue("@Content", content ?? (object)DBNull.Value);
                        updateCommand.Parameters.AddWithValue("@ImageURL", imageURL ?? (object)DBNull.Value);
                        updateCommand.Parameters.AddWithValue("@ImageText", image_Text ?? (object)DBNull.Value);

                        int rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                        if (rowsAffected > 0)
                        {
                            return Ok($"{rowsAffected} row(s) updated successfully.");
                        }
                        else
                        {
                            return NotFound("No matching row found to update.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //[HttpGet("updateContentData")]
        //public async Task<IActionResult> UpdateContentData(
        //    int rowIndex,
        //    string colIndex,
        //    string content_ID,
        //    string ordering,
        //    string content_Type,
        //    string content,
        //    string imageURL,
        //    string image_Text)
        //{
        //    string sqlDataSource = "Data Source=SANJEEV\\SQLEXPRESS; Initial Catalog=MB; TrustServerCertificate=True; User ID=sa; Password=candy";

        //    try
        //    {
        //        // Check if all columns are filled
        //        bool isAllFieldsFilled = !string.IsNullOrEmpty(content_ID) &&
        //                                  !string.IsNullOrEmpty(ordering) &&
        //                                  !string.IsNullOrEmpty(content_Type) &&
        //                                  !string.IsNullOrEmpty(content) &&
        //                                  !string.IsNullOrEmpty(imageURL) &&
        //                                  !string.IsNullOrEmpty(image_Text);

        //        string updateQuery = string.Empty;

        //        if (isAllFieldsFilled)
        //        {
        //            // Full Update Query: Update all columns as provided
        //            updateQuery = @"
        //        WITH RowNumbered AS (
        //            SELECT *, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RowNum
        //            FROM User_manual
        //        )
        //        UPDATE RowNumbered
        //        SET
        //            Content_ID = @Content_ID,
        //            Ordering = @Ordering,
        //            Content_Type = @Content_Type,
        //            Content = @Content,
        //            ImageURL = @ImageURL,
        //            ImageText = @ImageText
        //        WHERE RowNum = @RowIndex";
        //        }
        //        else
        //        {
        //            // Partial Update Query: Update only non-null values (keep existing ones if not provided)
        //            updateQuery = @"
        //        WITH RowNumbered AS (
        //            SELECT *, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RowNum
        //            FROM User_manual
        //        )
        //        UPDATE RowNumbered
        //        SET
        //            Content_ID = COALESCE(NULLIF(@Content_ID, ''), Content_ID),
        //            Ordering = COALESCE(NULLIF(@Ordering, ''), Ordering),
        //            Content_Type = COALESCE(NULLIF(@Content_Type, ''), Content_Type),
        //            Content = COALESCE(NULLIF(@Content, ''), Content),
        //            //ImageURL = COALESCE(NULLIF(@ImageURL, ''), ImageURL),
        //            //ImageText = COALESCE(NULLIF(@ImageText, ''), ImageText)
        //        WHERE RowNum = @RowIndex";
        //        }

        //        using (SqlConnection connection = new SqlConnection(sqlDataSource))
        //        {
        //            await connection.OpenAsync();
        //            using (SqlCommand updateCommand = new SqlCommand(updateQuery, connection))
        //            {
        //                // Add parameters, using DBNull.Value if the field is empty
        //                updateCommand.Parameters.AddWithValue("@RowIndex", rowIndex);
        //                updateCommand.Parameters.AddWithValue("@Content_ID", content_ID ?? (object)DBNull.Value);
        //                updateCommand.Parameters.AddWithValue("@Ordering", ordering ?? (object)DBNull.Value);
        //                updateCommand.Parameters.AddWithValue("@Content_Type", content_Type ?? (object)DBNull.Value);
        //                updateCommand.Parameters.AddWithValue("@Content", content ?? (object)DBNull.Value);
        //                updateCommand.Parameters.AddWithValue("@ImageURL", string.IsNullOrEmpty(imageURL) ? (object)DBNull.Value : imageURL);
        //                updateCommand.Parameters.AddWithValue("@ImageText", string.IsNullOrEmpty(image_Text) ? (object)DBNull.Value : image_Text);

        //                // Execute the update
        //                int rowsAffected = await updateCommand.ExecuteNonQueryAsync();
        //                if (rowsAffected > 0)
        //                {
        //                    return Ok($"{rowsAffected} row(s) updated successfully.");
        //                }
        //                else
        //                {
        //                    return NotFound("No matching row found to update.");
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Internal server error: {ex.Message}");
        //    }
        //}


    }
}


    

            
        
    



