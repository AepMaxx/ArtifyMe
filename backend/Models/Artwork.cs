using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ArtifyMe.Models.DTOs;

namespace ArtifyMe.Models
{
    public class Artwork
    {
        [Key]
        public string? Id { get; set; }

        [Required]
        [StringLength(255)]
        public string UserEmail { get; set; } = string.Empty;

        public string? SketchedImage { get; set; }

        public string? AiImage { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(1000)]
        public string? MutatedPrompt { get; set; }

        public MutationStyle? AppliedStyle { get; set; }

        public DateTime CreationDateTime { get; set; } = DateTime.UtcNow;

        // Navigation property for associated PathData entities
        public ICollection<PathData> Paths { get; set; } = new List<PathData>();
    }
}